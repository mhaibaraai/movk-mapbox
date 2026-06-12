import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxTemperature from '../src/runtime/components/environment/Temperature.vue'
import MapboxSpriteImage from '../src/runtime/components/effects/SpriteImage.vue'
import MapboxAnimatedImage from '../src/runtime/components/effects/AnimatedImage.vue'

// fake gl Map:含图层/源/图片三类资源跟踪,供热力与帧动画图标组件验证建/拆
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const layers = new Set<string>()
    const sources = new Set<string>()
    const images = new Set<string>()
    const self = {
      layers,
      sources,
      images,
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
      addLayer: (spec: { id: string }) => layers.add(spec.id),
      removeLayer: (id: string) => layers.delete(id),
      setPaintProperty() {},
      setLayoutProperty() {},
      setLayerZoomRange() {},
      setFilter() {},
      getSource: (id: string) => (sources.has(id) ? { setData() {}, setUrl() {}, setTiles() {}, updateImage() {} } : undefined),
      addSource: (id: string) => sources.add(id),
      removeSource: (id: string) => sources.delete(id),
      hasImage: (name: string) => images.has(name),
      addImage: (name: string) => images.add(name),
      updateImage() {},
      removeImage: (name: string) => images.delete(name),
      triggerRepaint() {},
      resize() {},
      remove() {},
      getCenter: () => ({ lng: 0, lat: 0 }),
      getZoom: () => 1,
      getBearing: () => 0,
      getPitch: () => 0,
      setCenter() {},
      setZoom() {},
      setBearing() {},
      setPitch() {},
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

const POINTS = {
  type: 'FeatureCollection' as const,
  features: [{ type: 'Feature' as const, properties: { temperature: 20 }, geometry: { type: 'Point' as const, coordinates: [0, 0] } }]
}

describe('Temperature 温度热力', () => {
  it('样式就绪建立 geojson 源与 heatmap 图层,卸载清理', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value ? h(MapboxTemperature, { data: POINTS, layerId: 'temp' }) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.sources.has('temp')).toBe(true)
    expect(map.layers.has('temp')).toBe(true)

    show.value = false
    await nextTick()
    expect(map.layers.has('temp')).toBe(false)
    expect(map.sources.has('temp')).toBe(false)
  })
})

describe('SpriteImage 帧动画图标', () => {
  it('样式就绪建立源与 symbol 图层,卸载清理且不抛错', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value
            ? h(MapboxSpriteImage, { data: POINTS, image: 'data:image/png;base64,', frames: 8, layerId: 'sp' })
            : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.sources.has('sp')).toBe(true)
    expect(map.layers.has('sp')).toBe(true)
    // StyleImageInterface 在 onReady 无条件注册,图片名恒存在(消除 styleimagemissing)
    expect(map.images.has('sp-frames')).toBe(true)

    show.value = false
    await expect(nextTick()).resolves.toBeUndefined()
    expect(map.layers.has('sp')).toBe(false)
    expect(map.sources.has('sp')).toBe(false)
    expect(map.images.has('sp-frames')).toBe(false)
  })

  it('styleimagemissing 兜底:缺图时按需重新注册', async () => {
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxSpriteImage, { data: POINTS, image: 'data:image/png;base64,', frames: 8, layerId: 'sp' })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    // 模拟样式重载竞态:图片名意外缺失后触发 styleimagemissing
    map.images.delete('sp-frames')
    map.fire('styleimagemissing', { id: 'sp-frames' })
    expect(map.images.has('sp-frames')).toBe(true)

    // 非本组件的缺图不应误触发
    map.images.delete('sp-frames')
    map.fire('styleimagemissing', { id: 'other-icon' })
    expect(map.images.has('sp-frames')).toBe(false)
  })
})

describe('AnimatedImage 动图图标', () => {
  it('样式就绪建立源与 symbol 图层并注册图片,卸载清理', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value
            ? h(MapboxAnimatedImage, { data: POINTS, image: 'https://example.com/a.gif', layerId: 'ani' })
            : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.sources.has('ani')).toBe(true)
    expect(map.layers.has('ani')).toBe(true)
    // 无 ImageDecoder 环境帧为空,但帧驱动仍注册图片名(透明占位)消除 styleimagemissing
    expect(map.images.has('ani-frames')).toBe(true)

    show.value = false
    await expect(nextTick()).resolves.toBeUndefined()
    expect(map.layers.has('ani')).toBe(false)
    expect(map.sources.has('ani')).toBe(false)
    expect(map.images.has('ani-frames')).toBe(false)
  })
})
