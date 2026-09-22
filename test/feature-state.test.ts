import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import { useFeatureState } from '../src/runtime/composables/useFeatureState'
import type { UseFeatureStateReturn } from '../src/runtime/composables/useFeatureState'

const { maps, rendered, sourceFeatures, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  // queryRenderedFeatures / querySourceFeatures 的返回值，由用例控制数据更新后要素是否仍存在
  const rendered: unknown[] = []
  const sourceFeatures: unknown[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const onceHandlers: Record<string, Set<(e?: unknown) => void>> = {}
    const canvas = document.createElement('canvas')
    const self = {
      on(type: string, a: unknown, b?: unknown) {
        (handlers[type] ??= new Set()).add((b ?? a) as (e?: unknown) => void)
      },
      once(type: string, fn: (e?: unknown) => void) {
        (onceHandlers[type] ??= new Set()).add(fn)
      },
      off(type: string, a: unknown, b?: unknown) {
        const fn = (b ?? a) as (e?: unknown) => void
        handlers[type]?.delete(fn)
        onceHandlers[type]?.delete(fn)
      },
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
        const once = [...(onceHandlers[type] ?? [])]
        onceHandlers[type]?.clear()
        once.forEach(fn => fn(e))
      },
      setFeatureState: vi.fn(),
      removeFeatureState: vi.fn(),
      getLayer: (id: string) => (id === 'poi' ? { source: 'poi-src' } : undefined),
      project: (lngLat: unknown) => lngLat,
      queryRenderedFeatures: () => [...rendered],
      querySourceFeatures: vi.fn(() => [...sourceFeatures]),
      getCanvas: () => canvas,
      isStyleLoaded: () => true,
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
  return { maps, rendered, sourceFeatures, makeFakeMap }
})

vi.mock('maplibre-gl', () => {
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  return {
    Map: FakeGlMap,
    LngLat: { convert: (v: unknown) => v },
    Marker: function () {},
    Popup: function () {}
  }
})

const poi = (id: number, title = `poi-${id}`) => ({
  id,
  source: 'poi-src',
  properties: { title },
  geometry: { type: 'Point', coordinates: [0, 0] }
})
const lngLat = { lng: 0, lat: 0 }

async function mountFeatureState() {
  let state!: UseFeatureStateReturn
  const Child = defineComponent({
    setup() {
      state = useFeatureState('poi')
      return () => null
    }
  })
  const wrapper = mount(defineComponent({
    setup: () => () => h(MaplibreMap, { options: {} }, { default: () => h(Child) })
  }), { attachTo: document.body })
  const map = maps[maps.length - 1]!
  map.fire('load')
  await nextTick()
  await nextTick()
  return { wrapper, map, state }
}

function dataChanged(map: typeof maps[number]) {
  map.fire('sourcedata', { sourceId: 'poi-src', sourceDataType: 'content' })
  map.fire('idle')
}

describe('useFeatureState 图层数据更新', () => {
  beforeEach(() => {
    maps.length = 0
    rendered.length = 0
    sourceFeatures.length = 0
  })

  it('原位置已无要素时清除 hover', async () => {
    const { wrapper, map, state } = await mountFeatureState()
    const old = poi(1)
    map.fire('mousemove', { features: [old], lngLat })

    dataChanged(map)

    expect(map.removeFeatureState).toHaveBeenCalledWith(old, 'hover')
    expect(state.hovered.value).toBeUndefined()
    wrapper.unmount()
  })

  it('原位置换成其他要素时 hover 转移到新要素', async () => {
    const { wrapper, map, state } = await mountFeatureState()
    const old = poi(1)
    const next = poi(2)
    map.fire('mousemove', { features: [old], lngLat })

    rendered.push(next)
    dataChanged(map)

    expect(map.removeFeatureState).toHaveBeenCalledWith(old, 'hover')
    expect(map.setFeatureState).toHaveBeenLastCalledWith(next, { hover: true })
    expect(state.hovered.value).toBe(next)
    wrapper.unmount()
  })

  it('同 id 要素仍在原位置时保留 hover 并刷新引用', async () => {
    const { wrapper, map, state } = await mountFeatureState()
    map.fire('mousemove', { features: [poi(1)], lngLat })

    const refreshed = poi(1, 'updated')
    rendered.push(refreshed)
    dataChanged(map)

    expect(map.removeFeatureState).not.toHaveBeenCalled()
    expect(state.hovered.value).toBe(refreshed)
    wrapper.unmount()
  })

  it('选中要素的 id 仍存在时保留选中', async () => {
    const { wrapper, map, state } = await mountFeatureState()
    const old = poi(1)
    map.fire('click', { features: [old], lngLat })

    sourceFeatures.push(poi(1, 'updated'))
    dataChanged(map)

    expect(map.querySourceFeatures).toHaveBeenCalledWith('poi-src', { sourceLayer: undefined, filter: ['==', ['id'], 1] })
    expect(map.removeFeatureState).not.toHaveBeenCalled()
    expect(state.selected.value).toBe(old)
    wrapper.unmount()
  })

  it('选中要素的 id 已不存在时清除选中', async () => {
    const { wrapper, map, state } = await mountFeatureState()
    const old = poi(1)
    map.fire('click', { features: [old], lngLat })

    dataChanged(map)

    expect(map.removeFeatureState).toHaveBeenCalledWith(old, 'selected')
    expect(state.selected.value).toBeUndefined()
    wrapper.unmount()
  })
})
