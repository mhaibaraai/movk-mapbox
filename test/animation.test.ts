import { afterEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreCustomLayer from '../src/runtime/components/CustomLayer.vue'
import { useMapAnimation } from '../src/runtime/composables/useMapAnimation'

const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const layers = new Set<string>()
    const self = {
      layers,
      addLayerCalls: 0,
      styleLoaded: true,
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
      isStyleLoaded: () => self.styleLoaded,
      getLayer: (id: string) => (layers.has(id) ? { id } : undefined),
      addLayer(spec: { id: string }) {
        layers.add(spec.id)
        self.addLayerCalls++
      },
      removeLayer: (id: string) => layers.delete(id),
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

vi.mock('maplibre-gl', () => {
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  function Noop() {}
  return {
    Map: FakeGlMap,
    LngLat: { convert: (v: unknown) => v },
    Marker: Noop,
    Popup: Noop
  }
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CustomLayer', () => {
  it('样式就绪挂载图层，setStyle 重载后重建，卸载移除', async () => {
    const layer = { id: 'custom-gl', type: 'custom' as const, render: () => {} }
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value ? h(MaplibreCustomLayer, { layer }) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.layers.has('custom-gl')).toBe(true)

    // 模拟样式重载清空图层后 onReady 重建
    map.layers.clear()
    map.fire('style.load')
    expect(map.layers.has('custom-gl')).toBe(true)
    expect(map.addLayerCalls).toBe(2)

    show.value = false
    await nextTick()
    expect(map.layers.has('custom-gl')).toBe(false)
  })
})

describe('useMapAnimation', () => {
  // 手动驱动 rAF：捕获回调逐帧触发，规避真实定时器抖动
  function stubRaf() {
    const callbacks: FrameRequestCallback[] = []
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      callbacks.push(cb)
      return callbacks.length
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    return {
      tick(timestamp: number) {
        const pending = callbacks.splice(0)
        for (const cb of pending) cb(timestamp)
      }
    }
  }

  function mountAnimation() {
    const frames: Array<[number, number]> = []
    const Child = defineComponent({
      setup() {
        useMapAnimation((_map, elapsed, delta) => frames.push([elapsed, delta]))
        return () => h('div')
      }
    })
    const wrapper = mount(MaplibreMap, {
      props: { options: {} },
      slots: { default: () => h(Child) }
    })
    return { frames, wrapper, map: maps[maps.length - 1]! }
  }

  it('首次 load 前不调 frame；之后以动画起点计 elapsed', () => {
    const raf = stubRaf()
    const { frames, wrapper, map } = mountAnimation()

    raf.tick(1000)
    expect(frames).toHaveLength(0)

    // 样式已解析但首次 load 未触发：逐帧改样式会一直推迟 load
    map.fire('style.load')
    raf.tick(1500)
    expect(frames).toHaveLength(0)

    map.fire('load')
    raf.tick(2000)
    raf.tick(2500)
    // 起点为首个有效帧时间戳，elapsed 从 0 起算
    expect(frames.map(([elapsed]) => elapsed)).toEqual([0, 500])
    wrapper.unmount()
  })

  it('瓦片/源加载中（isStyleLoaded 为 false）仍逐帧执行', () => {
    const raf = stubRaf()
    const { frames, wrapper, map } = mountAnimation()
    map.fire('style.load')
    map.fire('load')

    map.styleLoaded = false
    raf.tick(1000)
    raf.tick(1016)
    raf.tick(1032)
    expect(frames.map(([elapsed]) => elapsed)).toEqual([0, 16, 32])
    wrapper.unmount()
  })

  it('styledataloading 后暂停，再次 style.load 恢复', () => {
    const raf = stubRaf()
    const { frames, wrapper, map } = mountAnimation()
    map.fire('style.load')
    map.fire('load')
    raf.tick(1000)

    map.fire('styledataloading')
    raf.tick(1100)
    expect(frames).toHaveLength(1)

    map.fire('style.load')
    raf.tick(1200)
    expect(frames.map(([elapsed]) => elapsed)).toEqual([0, 200])
    wrapper.unmount()
  })

  it('frame 第三参为相邻 rAF 帧间隔', () => {
    const raf = stubRaf()
    const { frames, wrapper, map } = mountAnimation()
    map.fire('style.load')
    map.fire('load')

    raf.tick(1000)
    raf.tick(1016)
    raf.tick(1050)
    expect(frames.slice(1).map(([, delta]) => delta)).toEqual([16, 34])
    wrapper.unmount()
  })
})
