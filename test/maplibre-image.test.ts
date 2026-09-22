import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreTextureBuilding from '../src/runtime/components/effects/TextureBuilding.vue'
import { useMaplibreImage } from '../src/runtime/composables/useMaplibreImage'

// fake gl Map:loadImage 由测试逐个 resolve/reject,图片按名记录注册的 data
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const images = new Map<string, unknown>()
    const layers = new Set<string>()
    const sources = new Set<string>()
    const loads: Array<{ url: string, resolve: (v: { data: unknown }) => void, reject: (e: unknown) => void }> = []
    const self = {
      images,
      layers,
      sources,
      loads,
      removed: [] as string[],
      on(type: string, a: unknown, b?: unknown) {
        ;(handlers[type] ??= new Set()).add((b ?? a) as (e?: unknown) => void)
      },
      off(type: string, a: unknown, b?: unknown) {
        handlers[type]?.delete((b ?? a) as (e?: unknown) => void)
      },
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
      },
      isStyleLoaded: () => true,
      loadImage: (url: string) => new Promise((resolve, reject) => loads.push({ url, resolve, reject })),
      hasImage: (name: string) => images.has(name),
      addImage: (name: string, data: unknown) => images.set(name, data),
      removeImage: (name: string) => {
        self.removed.push(name)
        images.delete(name)
      },
      getLayer: (id: string) => (layers.has(id) ? { id } : undefined),
      addLayer: (spec: { id: string }) => layers.add(spec.id),
      removeLayer: (id: string) => layers.delete(id),
      moveLayer() {},
      setPaintProperty() {},
      setLayoutProperty() {},
      setLayerZoomRange() {},
      setFilter() {},
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

vi.mock('maplibre-gl', () => {
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  function Noop() {}
  return { Map: FakeGlMap, LngLat: { convert: (v: unknown) => v }, Marker: Noop, Popup: Noop }
})

function mountImage(initial: string) {
  const url = ref(initial)
  let loaded: { value: boolean } = { value: false }
  const Child = defineComponent({
    setup() {
      loaded = useMaplibreImage('pic', () => url.value).loaded
      return () => null
    }
  })
  mount(defineComponent({
    setup: () => () => h(MaplibreMap, { options: {} }, { default: () => h(Child) })
  }))
  const map = maps[maps.length - 1]!
  map.fire('load')
  map.fire('style.load')
  return { url, map, loaded: () => loaded.value }
}

describe('useMaplibreImage 响应式 url', () => {
  beforeEach(() => {
    maps.length = 0
  })

  it('url 变化后加载新图并替换同名图片，换图期间 loaded 保持 true', async () => {
    const { url, map, loaded } = mountImage('a.png')
    await flushPromises()
    map.loads[0]!.resolve({ data: 'A' })
    await flushPromises()
    expect(map.images.get('pic')).toBe('A')
    expect(loaded()).toBe(true)

    url.value = 'b.png'
    await nextTick()
    expect(map.loads.at(-1)!.url).toBe('b.png')
    expect(loaded()).toBe(true)

    map.loads.at(-1)!.resolve({ data: 'B' })
    await flushPromises()
    expect(map.images.get('pic')).toBe('B')
  })

  it('新图加载失败时保留旧图', async () => {
    const { url, map, loaded } = mountImage('a.png')
    await flushPromises()
    map.loads[0]!.resolve({ data: 'A' })
    await flushPromises()

    url.value = 'broken.png'
    await nextTick()
    map.loads.at(-1)!.reject(new Error('404'))
    await flushPromises()
    expect(map.images.get('pic')).toBe('A')
    expect(loaded()).toBe(true)
  })

  it('url 连续变化时丢弃晚到的旧图', async () => {
    const { url, map } = mountImage('a.png')
    await flushPromises()
    map.loads[0]!.resolve({ data: 'A' })
    await flushPromises()

    url.value = 'b.png'
    await nextTick()
    url.value = 'c.png'
    await nextTick()
    const [, b, c] = map.loads
    c!.resolve({ data: 'C' })
    await flushPromises()
    b!.resolve({ data: 'B' })
    await flushPromises()
    expect(map.images.get('pic')).toBe('C')
  })

  it('样式重载补回时使用最新 url', async () => {
    const { url, map } = mountImage('a.png')
    await flushPromises()
    map.loads[0]!.resolve({ data: 'A' })
    await flushPromises()
    url.value = 'b.png'
    await nextTick()
    map.loads.at(-1)!.resolve({ data: 'B' })
    await flushPromises()

    // setStyle 清空样式图片
    map.images.clear()
    map.fire('style.load')
    expect(map.loads.at(-1)!.url).toBe('b.png')
  })
})

describe('TextureBuilding 贴图 url', () => {
  it('url 变化后 loadImage 新地址并替换贴图，建筑图层不被拆除', async () => {
    const url = ref('a.png')
    mount(defineComponent({
      setup: () => () => h(MaplibreMap, { options: {} }, {
        default: () => h(MaplibreTextureBuilding, { url: url.value, layerId: 'tb', source: 'openmaptiles', sourceLayer: 'building' })
      })
    }))
    const map = maps[maps.length - 1]!
    // 矢量建筑源由底图样式提供
    map.sources.add('openmaptiles')
    map.fire('load')
    map.fire('style.load')
    await flushPromises()
    map.loads[0]!.resolve({ data: 'A' })
    await flushPromises()
    expect(map.layers.has('tb')).toBe(true)

    url.value = 'b.png'
    await nextTick()
    expect(map.loads.at(-1)!.url).toBe('b.png')
    map.loads.at(-1)!.resolve({ data: 'B' })
    await flushPromises()
    expect(map.images.get('tb-texture')).toBe('B')
    expect(map.layers.has('tb')).toBe(true)
  })
})
