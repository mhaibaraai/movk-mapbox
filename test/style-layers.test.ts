import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { LayerSpecification } from 'maplibre-gl'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreLayer from '../src/runtime/components/Layer.vue'
import MaplibreLayerGroup from '../src/runtime/components/LayerGroup.vue'
import { tiandituStyle } from '../src/runtime/utils/tianditu'
import type { FakeStyleMap } from './fixtures/fake-style-map'

const created = vi.hoisted(() => [] as FakeStyleMap[])

const STYLE = [
  { id: 'background', type: 'background' },
  { 'id': 'road-major', 'type': 'line', 'source-layer': 'transportation', 'paint': { 'line-opacity': 0.8 } },
  { 'id': 'place-label', 'type': 'symbol', 'source-layer': 'place', 'layout': { visibility: 'visible' } },
  { 'id': 'poi-label', 'type': 'symbol', 'source-layer': 'poi', 'layout': { visibility: 'none' } }
]

vi.mock('maplibre-gl', async () => {
  const { fakeStyleMap } = await import('./fixtures/fake-style-map')
  function FakeGlMap() {
    const map = fakeStyleMap(STYLE)
    created.push(map)
    return map
  }
  return { Map: FakeGlMap, LngLat: { convert: (v: unknown) => v } }
})

const inlineSource = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } as const
const isSymbol = (layer: LayerSpecification) => layer.type === 'symbol'

function mountGroup(props: () => Record<string, unknown>, show = ref(true)) {
  const wrapper = mount(defineComponent({
    setup() {
      return () => h(MaplibreMap, { options: {} }, {
        default: () => [
          // 运行时业务图层：同为 symbol，不应被认领
          h(MaplibreLayer, { layerId: 'my-labels', type: 'symbol', source: inlineSource }),
          show.value ? h(MaplibreLayerGroup, { title: '注记', styleLayers: isSymbol, ...props() }) : null
        ]
      })
    }
  }))
  const map = created.at(-1)!
  map.fire('style.load')
  return { wrapper, map, show }
}

describe('MaplibreLayerGroup styleLayers', () => {
  it('只认领样式自带的匹配图层，运行时图层不受影响', async () => {
    const { map } = mountGroup(() => ({ visible: false }))
    await nextTick()
    expect(map.layers.get('place-label')!.layout.visibility).toBe('none')
    expect(map.layers.get('my-labels')!.layout.visibility).toBeUndefined()
    expect(map.layers.get('road-major')!.layout.visibility).toBeUndefined()
  })

  it('可见时恢复原本的 visibility，原本隐藏的图层保持隐藏', async () => {
    const visible = ref(false)
    const { map } = mountGroup(() => ({ visible: visible.value }))
    await nextTick()
    expect(map.layers.get('place-label')!.layout.visibility).toBe('none')
    visible.value = true
    await nextTick()
    expect(map.layers.get('place-label')!.layout.visibility).toBe('visible')
    expect(map.layers.get('poi-label')!.layout.visibility).toBe('none')
  })

  it('透明度按原值缩放，未设置按默认值 1', async () => {
    const opacity = ref(0.5)
    const Wrapper = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => h(MaplibreLayerGroup, { title: '道路', opacity: opacity.value, styleLayers: (l: LayerSpecification) => l.type === 'line' })
        })
      }
    })
    mount(Wrapper)
    const map = created.at(-1)!
    map.fire('style.load')
    await nextTick()
    expect(map.layers.get('road-major')!.paint['line-opacity']).toBeCloseTo(0.4)

    opacity.value = 1
    await nextTick()
    expect(map.layers.get('road-major')!.paint['line-opacity']).toBe(0.8)
  })

  it('setStyle 后按新样式重新认领并保持状态', async () => {
    const { map } = mountGroup(() => ({ visible: false }))
    await nextTick()
    map.replaceStyle([{ id: 'label-new', type: 'symbol' }])
    await nextTick()
    expect(map.layers.get('label-new')!.layout.visibility).toBe('none')
  })

  it('天地图栅格注记按图层 id 认领，底图图层不受影响', async () => {
    const opacity = ref(0.5)
    const visible = ref(true)
    const isAnnotation = (layer: LayerSpecification) => /^tianditu-c[vit]a$/.test(layer.id)
    mount(defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => h(MaplibreLayerGroup, { title: '注记', visible: visible.value, opacity: opacity.value, styleLayers: isAnnotation })
        })
      }
    }))
    const map = created.at(-1)!
    map.fire('style.load')
    map.replaceStyle(tiandituStyle('vec', { annotation: true, tk: 'test' }).layers)
    await nextTick()
    expect(map.layers.get('tianditu-cva')!.paint['raster-opacity']).toBe(0.5)
    expect(map.layers.get('tianditu-vec')!.paint['raster-opacity']).toBeUndefined()

    visible.value = false
    await nextTick()
    expect(map.layers.get('tianditu-cva')!.layout.visibility).toBe('none')
    expect(map.layers.get('tianditu-vec')!.layout.visibility).toBeUndefined()
  })

  it('卸载时恢复原值', async () => {
    const show = ref(true)
    const { map } = mountGroup(() => ({ visible: false, opacity: 0.5 }), show)
    await nextTick()
    show.value = false
    await nextTick()
    expect(map.layers.get('place-label')!.layout.visibility).toBe('visible')
    expect(map.layers.get('poi-label')!.layout.visibility).toBe('none')
    expect(map.layers.get('place-label')!.paint['text-opacity']).toBeUndefined()
  })
})
