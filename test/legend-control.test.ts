import { describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import MaplibreLayer from '../src/runtime/components/Layer.vue'
import MaplibreLayerGroup from '../src/runtime/components/LayerGroup.vue'
import MaplibreLegend from '../src/runtime/components/controls/Legend.vue'
import type { FakeStyleMap } from './fixtures/fake-style-map'
import { mountInMap } from './fixtures/mount-map'

const created = vi.hoisted(() => [] as FakeStyleMap[])

vi.mock('maplibre-gl', async () => {
  const { fakeStyleMap } = await import('./fixtures/fake-style-map')
  function FakeGlMap() {
    const map = fakeStyleMap()
    created.push(map)
    return map
  }
  return { Map: FakeGlMap, LngLat: { convert: (v: unknown) => v } }
})

const inlineSource = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } as const

function groups(visible = ref(true)) {
  return [
    h(MaplibreLayerGroup, { title: '河流', visible: visible.value }, {
      default: () => h(MaplibreLayer, { layerId: 'r', type: 'line', source: inlineSource, paint: { 'line-color': '#00f' } })
    }),
    h(MaplibreLayerGroup, { title: '用地' }, {
      default: () => h(MaplibreLayer, {
        layerId: 'l',
        type: 'fill',
        source: inlineSource,
        paint: { 'fill-color': ['match', ['get', 'k'], 'a', '#f00', 'b', '#0f0', '#999'] }
      })
    })
  ]
}

describe('MaplibreLegend', () => {
  it('默认展开，单项组显示为一行，多项组显示标题与分项', async () => {
    const { control, wrapper } = await mountInMap(created, () => [...groups(), h(MaplibreLegend)])
    const panel = control('.movk-maplibre-control__panel')!
    expect(panel.style.display).toBe('')
    const rows = [...panel.querySelectorAll('.movk-maplibre-legend__row')].map(el => el.textContent?.trim())
    expect(rows).toEqual(['河流', 'a', 'b'])
    expect(panel.querySelector('.movk-maplibre-legend__heading')?.textContent).toBe('用地')
    expect(panel.querySelector<HTMLElement>('.movk-maplibre-legend__swatch--line')!.style.background).toBeTruthy()
    wrapper.unmount()
  })

  it('隐藏的组不显示图例', async () => {
    const visible = ref(true)
    const { control, wrapper } = await mountInMap(created, () => [...groups(visible), h(MaplibreLegend)])
    visible.value = false
    await nextTick()
    const rows = [...control('.movk-maplibre-control__panel')!.querySelectorAll('.movk-maplibre-legend__row')].map(el => el.textContent?.trim())
    expect(rows).toEqual(['a', 'b'])
    wrapper.unmount()
  })

  it('点击外部不收起图例', async () => {
    const { control, wrapper } = await mountInMap(created, () => [...groups(), h(MaplibreLegend)])
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(control('.movk-maplibre-control__panel')!.style.display).toBe('')
    wrapper.unmount()
  })

  it('groups 按标题过滤', async () => {
    const { control, wrapper } = await mountInMap(created, () => [...groups(), h(MaplibreLegend, { groups: ['河流'] })])
    const rows = [...control('.movk-maplibre-control__panel')!.querySelectorAll('.movk-maplibre-legend__row')].map(el => el.textContent?.trim())
    expect(rows).toEqual(['河流'])
    wrapper.unmount()
  })
})
