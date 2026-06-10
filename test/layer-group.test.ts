import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxLayer from '../src/runtime/components/Layer.vue'
import MapboxLayerGroup from '../src/runtime/components/LayerGroup.vue'

// 记录 addLayer 锚点与 setLayoutProperty 调用的 fake gl Map
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const layers = new Set<string>()
    const sources = new Set<string>()
    const self = {
      layers,
      addLayerAnchors: [] as (string | undefined)[],
      layoutCalls: [] as [string, string, unknown][],
      on(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        ;(handlers[type] ??= new Set()).add(listener)
      },
      off(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        handlers[type]?.delete(listener)
      },
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
      },
      isStyleLoaded: () => true,
      getLayer: (id: string) => (layers.has(id) ? { id } : undefined),
      addLayer(spec: { id: string }, before?: string) {
        layers.add(spec.id)
        self.addLayerAnchors.push(before)
      },
      removeLayer: (id: string) => layers.delete(id),
      setLayoutProperty(id: string, key: string, value: unknown) {
        self.layoutCalls.push([id, key, value])
      },
      getSource: (id: string) => (sources.has(id) ? { setData() {} } : undefined),
      addSource: (id: string) => sources.add(id),
      removeSource: (id: string) => sources.delete(id),
      resize() {},
      remove() {},
      getCenter: () => ({ lng: 0, lat: 0 }),
      getZoom: () => 1,
      getBearing: () => 0,
      getPitch: () => 0,
      setStyle() {}
    }
    maps.push(self)
    return self
  }
  return { maps, makeFakeMap }
})

vi.mock('mapbox-gl', () => {
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  function Noop() {}
  return {
    default: { Map: FakeGlMap, accessToken: '', prewarm() {}, setRTLTextPlugin() {} },
    LngLat: { convert: (v: unknown) => v },
    Marker: Noop,
    Popup: Noop
  }
})

const inlineSource = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } as const

describe('LayerGroup', () => {
  it('组 visible 切换批量设置子图层 visibility；初始 false 时建层即隐藏', async () => {
    const visible = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxLayerGroup, { visible: visible.value }, {
            default: () => [
              h(MapboxLayer, { layerId: 'a', type: 'circle', source: inlineSource }),
              h(MapboxLayer, { layerId: 'b', type: 'line', source: inlineSource })
            ]
          })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    expect(map.layers.has('a')).toBe(true)
    expect(map.layers.has('b')).toBe(true)
    expect(map.layoutCalls).toHaveLength(0)

    visible.value = false
    await nextTick()
    const hidden = map.layoutCalls.filter(([, key, value]) => key === 'visibility' && value === 'none')
    expect(hidden.map(([id]) => id).sort()).toEqual(['a', 'b'])

    visible.value = true
    await nextTick()
    const shown = map.layoutCalls.filter(([, key, value]) => key === 'visibility' && value === 'visible')
    expect(shown).toHaveLength(2)
  })

  it('子图层无自身 beforeId 时回退组锚点，自身优先', () => {
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => [
            // 先建锚点图层
            h(MapboxLayer, { layerId: 'anchor', type: 'circle', source: inlineSource }),
            h(MapboxLayerGroup, { beforeId: 'anchor' }, {
              default: () => [
                h(MapboxLayer, { layerId: 'inherits', type: 'circle', source: inlineSource }),
                h(MapboxLayer, { layerId: 'overrides', type: 'circle', source: inlineSource, beforeId: 'missing' })
              ]
            })
          ]
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    // anchor 无锚点；inherits 回退组 beforeId=anchor；overrides 自身锚点不存在 → undefined
    expect(map.addLayerAnchors).toEqual([undefined, 'anchor', undefined])
  })
})
