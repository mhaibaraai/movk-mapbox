import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreSky from '../src/runtime/components/environment/Sky.vue'
import MaplibreTerrain from '../src/runtime/components/environment/Terrain.vue'
import { logger } from '../src/runtime/utils/logger'

// 记录环境 setter 调用的 fake gl Map
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const sources = new Set<string>()
    const self = {
      sources,
      sourceSpecs: [] as unknown[],
      skyCalls: [] as unknown[],
      terrainCalls: [] as unknown[],
      styleLoaded: true,
      // 模拟 maplibre Style._checkLoaded：样式未加载完时样式级 setter 必抛
      checkLoaded() {
        if (!self.styleLoaded) throw new Error('Style is not done loading')
      },
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
      setSky(value: unknown) {
        self.checkLoaded()
        self.skyCalls.push(value)
      },
      setTerrain(value: unknown) {
        self.checkLoaded()
        self.terrainCalls.push(value)
      },
      getSource: (id: string) => (sources.has(id) ? {} : undefined),
      addSource: (id: string, spec: unknown) => {
        sources.add(id)
        self.sourceSpecs.push(spec)
      },
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
  return {
    Map: FakeGlMap,
    LngLat: { convert: (v: unknown) => v },
    Marker: Noop,
    Popup: Noop
  }
})

describe('Sky 天空与大气', () => {
  it('样式就绪即应用，options 变化重应用，卸载清除', async () => {
    const show = ref(true)
    const options = ref({ 'sky-color': '#88C6FC' })
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value ? h(MaplibreSky, { options: options.value }) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.skyCalls).toHaveLength(1)

    options.value = { 'sky-color': '#199EF3' }
    await nextTick()
    expect(map.skyCalls).toHaveLength(2)
    expect(map.skyCalls[1]).toEqual({ 'sky-color': '#199EF3' })

    show.value = false
    await nextTick()
    expect(map.skyCalls[2]).toEqual({})
  })

  it('setStyle 重载后经 onReady 自动重设', () => {
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => h(MaplibreSky)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    map.fire('style.load')
    expect(map.skyCalls).toHaveLength(2)
  })

  it('样式未加载完时卸载不抛错（导航离开场景）', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value ? h(MaplibreSky) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.skyCalls).toHaveLength(1)

    // 进入样式重载窗口期（如底图切换 setStyle 后），卸载清除被安全吞掉
    map.styleLoaded = false
    show.value = false
    await expect(nextTick()).resolves.toBeUndefined()
    expect(map.skyCalls).toHaveLength(1)
  })

  it('样式未加载完时 options 变更不抛错，style.load 后由 onReady 以最新值恢复', async () => {
    const options = ref<Record<string, unknown>>({ 'sky-color': '#88C6FC' })
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => h(MaplibreSky, { options: options.value })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    map.styleLoaded = false
    options.value = { 'atmosphere-blend': 0.5 }
    await expect(nextTick()).resolves.toBeUndefined()
    expect(map.skyCalls).toHaveLength(1)

    map.styleLoaded = true
    map.fire('style.load')
    expect(map.skyCalls[1]).toEqual({ 'atmosphere-blend': 0.5 })
  })
})

const DEM = {
  type: 'raster-dem' as const,
  tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
  encoding: 'terrarium' as const,
  tileSize: 256,
  maxzoom: 15
}

describe('Terrain 地形', () => {
  it('未传 source 时告警且不建源、不设地形', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => h(MaplibreTerrain as never)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    expect(map.sources.size).toBe(0)
    expect(map.terrainCalls).toHaveLength(0)
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('同一回调内先建 DEM 源再 setTerrain；卸载清地形并移除源', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value ? h(MaplibreTerrain, { source: DEM, exaggeration: 1.5 }) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.sources.has('movk-terrain-dem')).toBe(true)
    expect(map.sourceSpecs[0]).toEqual(DEM)
    expect(map.terrainCalls[0]).toEqual({ source: 'movk-terrain-dem', exaggeration: 1.5 })

    show.value = false
    await nextTick()
    expect(map.terrainCalls[1]).toBeNull()
    expect(map.sources.has('movk-terrain-dem')).toBe(false)
  })

  it('样式未加载完时卸载不抛错', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => (show.value ? h(MaplibreTerrain, { source: DEM }) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    map.styleLoaded = false
    show.value = false
    await expect(nextTick()).resolves.toBeUndefined()
    // setTerrain(null) 被吞掉，地形清除交由样式重载
    expect(map.terrainCalls).toHaveLength(1)
  })
})
