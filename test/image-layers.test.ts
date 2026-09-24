import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreTemperature from '../src/runtime/components/environment/Temperature.vue'
import MaplibreSpriteImage from '../src/runtime/components/effects/SpriteImage.vue'
import MaplibreAnimatedImage from '../src/runtime/components/effects/AnimatedImage.vue'

// fake gl Map:含图层/源/图片三类资源跟踪,供热力与帧动画图标组件验证建/拆
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const layers = new Set<string>()
    const sources = new Set<string>()
    const images = new Set<string>()
    const registered = new Map<string, { width: number, height: number }>()
    const self = {
      layers,
      sources,
      images,
      registered,
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
      getLayersOrder: () => [] as string[],
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
      addImage: (name: string, image: { width: number, height: number }) => {
        images.add(name)
        registered.set(name, image)
      },
      updateImage() {},
      removeImage: (name: string) => {
        images.delete(name)
        registered.delete(name)
      },
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

// happy-dom 无 canvas 2d:按请求尺寸返回透明帧,使切帧结果可观测
vi.mock('../src/runtime/utils/sprite', async importOriginal => ({
  ...await importOriginal<typeof import('../src/runtime/utils/sprite')>(),
  spriteFrame: (_source: unknown, _rect: unknown, size: number) => ({ data: new Uint8ClampedArray(size * size * 4) })
}))

const { decodeAnimatedImage } = vi.hoisted(() => ({
  decodeAnimatedImage: vi.fn(async (_url: string, _size: number) => ({ frames: [] as ImageData[], durations: [] as number[], size: 0 }))
}))
vi.mock('../src/runtime/utils/animated-image', () => ({ decodeAnimatedImage }))

const POINTS = {
  type: 'FeatureCollection' as const,
  features: [{ type: 'Feature' as const, properties: { temperature: 20 }, geometry: { type: 'Point' as const, coordinates: [0, 0] } }]
}

describe('Temperature 温度热力', () => {
  it('样式就绪建立 geojson 源与 heatmap 图层,卸载清理', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value ? h(MaplibreTemperature, { data: POINTS, layerId: 'temp' }) : null)
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
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value
            ? h(MaplibreSpriteImage, { data: POINTS, image: 'data:image/png;base64,', frames: 8, layerId: 'sp' })
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
        return () => h(MaplibreMap, { options: {} }, {
          default: () => h(MaplibreSpriteImage, { data: POINTS, image: 'data:image/png;base64,', frames: 8, layerId: 'sp' })
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
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value
            ? h(MaplibreAnimatedImage, { data: POINTS, image: 'https://example.com/a.gif', layerId: 'ani' })
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

// 可控加载时机的 Image 替身
const sheets: FakeImage[] = []
class FakeImage {
  width = 256
  height = 32
  crossOrigin = ''
  src = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor() {
    sheets.push(this)
  }
}

function mountSprite(props: Record<string, unknown>) {
  const state = ref<Record<string, unknown>>({ data: POINTS, image: 'a.png', frames: 8, layerId: 'sp', ...props })
  const Parent = defineComponent({
    setup() {
      return () => h(MaplibreMap, { options: {} }, { default: () => h(MaplibreSpriteImage, state.value) })
    }
  })
  mount(Parent)
  const map = maps[maps.length - 1]!
  map.fire('style.load')
  return { state, map }
}

describe('SpriteImage 响应式', () => {
  beforeEach(() => {
    sheets.length = 0
    vi.stubGlobal('Image', FakeImage)
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('size 变化后以新宽高重新注册图片,并复用已加载的雪碧图切帧', async () => {
    const { state, map } = mountSprite({ size: 32 })
    sheets[0]!.onload!()
    expect(map.registered.get('sp-frames')).toMatchObject({ width: 32, height: 32 })

    state.value = { ...state.value, size: 48 }
    await nextTick()
    const image = map.registered.get('sp-frames') as { width: number, render: () => boolean, data: Uint8Array }
    expect(image.width).toBe(48)
    expect(sheets).toHaveLength(1)
    // 新切帧与新纹理尺寸一致,可正常下发
    expect(image.render()).toBe(true)
    expect(image.data.length).toBe(48 * 48 * 4)
  })

  it('columns / frames 变化后同步重新切帧而不重新请求', async () => {
    const { state, map } = mountSprite({ size: 16 })
    sheets[0]!.onload!()
    const image = map.registered.get('sp-frames') as { render: () => boolean, data: Uint8Array }
    const first = (image.render(), image.data)

    state.value = { ...state.value, frames: 4, columns: 4 }
    await nextTick()
    expect(sheets).toHaveLength(1)
    // 帧序列更换后即刷新
    expect(image.render()).toBe(true)
    expect(image.data).not.toBe(first)
  })

  it('image 连续变化时丢弃晚到的旧图', async () => {
    const { state, map } = mountSprite({ size: 16 })
    state.value = { ...state.value, image: 'b.png' }
    await nextTick()
    expect(sheets).toHaveLength(2)

    // 旧图晚到:不应产出帧
    sheets[0]!.onload!()
    const image = map.registered.get('sp-frames') as { render: () => boolean }
    image.render()
    expect(image.render()).toBe(false)

    sheets[1]!.onload!()
    expect(image.render()).toBe(true)
  })
})

describe('AnimatedImage 响应式', () => {
  beforeEach(() => {
    decodeAnimatedImage.mockClear()
  })

  function frames(size: number, count = 2) {
    return Array.from({ length: count }, () => ({ data: new Uint8ClampedArray(size * size * 4) }) as ImageData)
  }

  it('size 变化后重新解码并以新宽高注册', async () => {
    decodeAnimatedImage.mockImplementation(async (_url, size) => ({ frames: frames(size), durations: [], size }))
    const state = ref<Record<string, unknown>>({ data: POINTS, image: 'a.gif', layerId: 'ani', size: 32 })
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, { default: () => h(MaplibreAnimatedImage, state.value) })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')
    await flushPromises()

    state.value = { ...state.value, size: 64 }
    await flushPromises()
    expect(decodeAnimatedImage).toHaveBeenLastCalledWith('a.gif', 64)
    const image = map.registered.get('ani-frames') as { width: number, render: () => boolean, data: Uint8Array }
    expect(image.width).toBe(64)
    expect(image.render()).toBe(true)
    expect(image.data.length).toBe(64 * 64 * 4)
  })

  it('image 连续变化时丢弃晚到的旧解码结果', async () => {
    const pending: Array<(v: { frames: ImageData[], durations: number[], size: number }) => void> = []
    decodeAnimatedImage.mockImplementation(() => new Promise(resolve => pending.push(resolve)))
    const state = ref<Record<string, unknown>>({ data: POINTS, image: 'a.gif', layerId: 'ani', size: 8 })
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, { default: () => h(MaplibreAnimatedImage, state.value) })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')
    await nextTick()

    state.value = { ...state.value, image: 'b.gif' }
    await nextTick()
    expect(pending).toHaveLength(2)

    const image = map.registered.get('ani-frames') as { render: () => boolean }
    image.render()
    pending[0]!({ frames: frames(8), durations: [], size: 8 })
    await flushPromises()
    expect(image.render()).toBe(false)

    pending[1]!({ frames: frames(8), durations: [], size: 8 })
    await flushPromises()
    expect(image.render()).toBe(true)
  })
})
