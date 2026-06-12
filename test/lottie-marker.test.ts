import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxLottieMarker from '../src/runtime/components/LottieMarker.vue'

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
  class FakeMarker {
    setLngLat() { return this }
    addTo() { return this }
    on() {}
    remove() {}
    getLngLat() { return { lng: 0, lat: 0 } }
  }
  return {
    default: { Map: FakeGlMap, accessToken: '', prewarm() {}, setRTLTextPlugin() {} },
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
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value
            ? h(MapboxLottieMarker, { lnglat: [0, 0], path: 'https://example.com/a.json', speed: 2 })
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
})
