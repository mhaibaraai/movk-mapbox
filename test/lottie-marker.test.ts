import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreLottieMarker from '../src/runtime/components/LottieMarker.vue'

// mock lottie-web(optional peer):记录 loadAnimation 与返回实例的 setSpeed/destroy
const { loadAnimation, anim } = vi.hoisted(() => {
  const anim = { setSpeed: vi.fn(), destroy: vi.fn() }
  const loadAnimation = vi.fn(() => anim)
  return { loadAnimation, anim }
})
vi.mock('lottie-web', () => ({ default: { loadAnimation } }))

const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const self = {
      on(type: string, a: unknown, b?: unknown) {
        ;(handlers[type] ??= new Set()).add((b ?? a) as (e?: unknown) => void)
      },
      off() {},
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
      },
      isStyleLoaded: () => true,
      getLayersOrder: () => [] as string[],
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
  class FakeMarker {
    setLngLat() { return this }
    addTo() { return this }
    on() {}
    remove() {}
    getLngLat() { return { lng: 0, lat: 0 } }
  }
  return {
    Map: FakeGlMap,
    LngLat: { convert: (v: unknown) => v },
    Marker: FakeMarker,
    Popup: function () {}
  }
})

describe('LottieMarker 动画标记', () => {
  it('挂载调用 loadAnimation 并设速度,卸载 destroy', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value
            ? h(MaplibreLottieMarker, { lnglat: [0, 0], path: 'https://example.com/a.json', speed: 2 })
            : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('load')
    await nextTick()

    expect(loadAnimation).toHaveBeenCalledTimes(1)
    expect(loadAnimation.mock.calls[0]![0]).toMatchObject({ renderer: 'svg', path: 'https://example.com/a.json' })
    expect(anim.setSpeed).toHaveBeenCalledWith(2)

    show.value = false
    await nextTick()
    expect(anim.destroy).toHaveBeenCalled()
  })

  describe('props 响应式', () => {
    beforeEach(() => {
      loadAnimation.mockClear()
      anim.setSpeed.mockClear()
      anim.destroy.mockClear()
    })

    async function mountLottie(initial: Record<string, unknown>) {
      const state = ref<Record<string, unknown>>({ lnglat: [0, 0], ...initial })
      const Parent = defineComponent({
        setup() {
          return () => h(MaplibreMap, { options: {} }, { default: () => h(MaplibreLottieMarker, state.value) })
        }
      })
      mount(Parent)
      maps[maps.length - 1]!.fire('load')
      await nextTick()
      return state
    }

    it('path 与 loop 变化时销毁旧实例并以新参数重新加载', async () => {
      const state = await mountLottie({ path: 'a.json' })
      expect(loadAnimation).toHaveBeenCalledTimes(1)

      state.value = { ...state.value, path: 'b.json' }
      await nextTick()
      expect(anim.destroy).toHaveBeenCalledTimes(1)
      expect(loadAnimation).toHaveBeenCalledTimes(2)
      expect(loadAnimation.mock.calls[1]![0]).toMatchObject({ path: 'b.json', loop: true })

      state.value = { ...state.value, loop: false }
      await nextTick()
      expect(anim.destroy).toHaveBeenCalledTimes(2)
      expect(loadAnimation.mock.calls[2]![0]).toMatchObject({ path: 'b.json', loop: false })
    })

    it('speed 变化只调速不重建', async () => {
      const state = await mountLottie({ path: 'a.json' })
      state.value = { ...state.value, speed: 3 }
      await nextTick()
      expect(anim.setSpeed).toHaveBeenLastCalledWith(3)
      expect(loadAnimation).toHaveBeenCalledTimes(1)
      expect(anim.destroy).not.toHaveBeenCalled()
    })

    it('animationData 按引用比较：同一引用不重建，换对象才重建', async () => {
      const data = { v: '5.0.0' }
      const state = await mountLottie({ animationData: data })

      state.value = { ...state.value, animationData: data }
      await nextTick()
      expect(loadAnimation).toHaveBeenCalledTimes(1)

      const next = { v: '5.0.0' }
      state.value = { ...state.value, animationData: next }
      await nextTick()
      expect(loadAnimation).toHaveBeenCalledTimes(2)
      expect(loadAnimation.mock.calls[1]![0]).toMatchObject({ animationData: next })
    })
  })
})
