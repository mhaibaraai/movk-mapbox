import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import type { FeatureCollection } from 'geojson'
import MapboxMap from '../src/runtime/components/Map.vue'
import { useMeasure } from '../src/runtime/composables/useMeasure'
import { formatArea, formatDistance } from '../src/runtime/utils/measure'

const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const layers = new Set<string>()
    const sources = new Map<string, unknown>()
    const canvas = { style: { cursor: '' } }
    let removed = false
    const self = {
      layers,
      sources,
      lastData: undefined as FeatureCollection | undefined,
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
      // 复刻 mapbox：remove() 后 style 为 undefined，getLayer/getSource 解引用即抛
      getLayer: (id: string) => {
        if (removed) throw new TypeError('Cannot read properties of undefined (reading \'getOwnLayer\')')
        return layers.has(id) ? { id } : undefined
      },
      addLayer: (spec: { id: string }) => layers.add(spec.id),
      removeLayer: (id: string) => layers.delete(id),
      getSource: (id: string) => {
        if (removed) throw new TypeError('Cannot read properties of undefined (reading \'getOwnSource\')')
        return sources.has(id)
          ? { setData: (data: FeatureCollection) => {
              self.lastData = data
            } }
          : undefined
      },
      addSource: (id: string, spec: unknown) => sources.set(id, spec),
      removeSource: (id: string) => sources.delete(id),
      doubleClickZoom: { disable: vi.fn(), enable: vi.fn() },
      // remove() 后 getCanvas() 返回 undefined（_canvas 被置空）
      getCanvas: () => (removed ? undefined : canvas),
      resize() {},
      remove() {
        removed = true
      },
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

describe('格式化', () => {
  it('距离与面积自动进位', () => {
    expect(formatDistance(560)).toBe('560 m')
    expect(formatDistance(1280)).toBe('1.28 km')
    expect(formatArea(900)).toBe('900 m²')
    expect(formatArea(2_560_000)).toBe('2.56 km²')
  })
})

async function mountMeasure() {
  let api!: ReturnType<typeof useMeasure>
  const Child = defineComponent({
    setup() {
      api = useMeasure()
      return () => h('div')
    }
  })
  const wrapper = mount(MapboxMap, {
    props: { options: {} },
    slots: { default: () => h(Child) }
  })
  const map = maps[maps.length - 1]!
  map.fire('load')
  map.fire('style.load')
  // whenLoaded 微任务续体（事件绑定）执行完
  await Promise.resolve()
  await Promise.resolve()
  return { wrapper, map, api }
}

function clickAt(map: { fire: (t: string, e?: unknown) => void }, lng: number, lat: number) {
  map.fire('click', { lngLat: { lng, lat } })
}

describe('useMeasure', () => {
  it('start 建源建层并禁用双击缩放；测距加点出实时读数', async () => {
    const { map, api } = await mountMeasure()

    api.start('distance')
    await Promise.resolve()
    await Promise.resolve()
    expect(map.sources.has('movk-measure')).toBe(true)
    expect(map.layers.has('movk-measure-line')).toBe(true)
    expect(map.doubleClickZoom.disable).toHaveBeenCalled()

    clickAt(map, 116.0, 39.0)
    clickAt(map, 116.1, 39.0)
    expect(api.result.value).toMatch(/km$/)

    // dblclick 结束：去重顶点 + 固化标签
    clickAt(map, 116.1, 39.0)
    map.fire('dblclick', { lngLat: { lng: 116.1, lat: 39.0 }, preventDefault: () => {} })
    const labels = map.lastData!.features.filter(f => f.properties?.label)
    expect(labels).toHaveLength(1)
    expect(api.result.value).toBe('')
  })

  it('测面三点成面出面积读数；clear 清空全部', async () => {
    const { map, api } = await mountMeasure()

    api.start('area')
    await Promise.resolve()
    await Promise.resolve()
    clickAt(map, 116.0, 39.0)
    clickAt(map, 116.1, 39.0)
    clickAt(map, 116.1, 39.1)
    expect(api.result.value).toMatch(/km²$/)

    api.clear()
    expect(map.lastData!.features).toHaveLength(0)
    expect(api.result.value).toBe('')
  })

  it('stop 解绑交互并恢复双击缩放', async () => {
    const { map, api } = await mountMeasure()
    api.start('distance')
    await Promise.resolve()
    await Promise.resolve()

    api.stop()
    expect(map.doubleClickZoom.enable).toHaveBeenCalled()
    expect(api.active.value).toBe(false)

    // 停止后点击不再加点
    clickAt(map, 116.0, 39.0)
    expect(api.result.value).toBe('')
  })

  it('卸载时底层地图已 remove，teardown 不抛', async () => {
    const { wrapper, map, api } = await mountMeasure()
    api.start('distance')
    await Promise.resolve()
    await Promise.resolve()

    // 模拟子组件（持图实例）先卸载销毁地图，父组件 teardown 随后运行
    map.remove()
    expect(() => wrapper.unmount()).not.toThrow()
  })
})
