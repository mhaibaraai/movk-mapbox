import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxFog from '../src/runtime/components/environment/Fog.vue'
import MapboxTerrain from '../src/runtime/components/environment/Terrain.vue'

// 记录环境 setter 调用的 fake gl Map
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const sources = new Set<string>()
    const self = {
      sources,
      fogCalls: [] as unknown[],
      terrainCalls: [] as unknown[],
      styleLoaded: true,
      // 模拟 mapbox Style._checkLoaded：样式未加载完时样式级 setter 必抛
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
      setFog(value: unknown) {
        self.checkLoaded()
        self.fogCalls.push(value)
      },
      setTerrain(value: unknown) {
        self.checkLoaded()
        self.terrainCalls.push(value)
      },
      getSource: (id: string) => (sources.has(id) ? {} : undefined),
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

describe('Fog 大气', () => {
  it('样式就绪即应用，options 变化重应用，卸载清除', async () => {
    const show = ref(true)
    const options = ref({ 'star-intensity': 0.2 })
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value ? h(MapboxFog, { options: options.value }) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.fogCalls).toHaveLength(1)

    options.value = { 'star-intensity': 0.8 }
    await nextTick()
    expect(map.fogCalls).toHaveLength(2)
    expect(map.fogCalls[1]).toEqual({ 'star-intensity': 0.8 })

    show.value = false
    await nextTick()
    expect(map.fogCalls[2]).toBeNull()
  })

  it('setStyle 重载后经 onReady 自动重设', () => {
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxFog)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    map.fire('style.load')
    expect(map.fogCalls).toHaveLength(2)
  })

  it('样式未加载完时卸载不抛错（导航离开场景）', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value ? h(MapboxFog) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.fogCalls).toHaveLength(1)

    // 进入样式重载窗口期（如底图切换 setStyle 后），卸载清除被安全吞掉
    map.styleLoaded = false
    show.value = false
    await expect(nextTick()).resolves.toBeUndefined()
    expect(map.fogCalls).toHaveLength(1)
  })

  it('样式未加载完时 options 变更不抛错，style.load 后由 onReady 以最新值恢复', async () => {
    const options = ref({ 'star-intensity': 0.2 })
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxFog, { options: options.value })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    map.styleLoaded = false
    options.value = { 'star-intensity': 0.9 }
    await expect(nextTick()).resolves.toBeUndefined()
    expect(map.fogCalls).toHaveLength(1)

    map.styleLoaded = true
    map.fire('style.load')
    expect(map.fogCalls[1]).toEqual({ 'star-intensity': 0.9 })
  })
})

describe('Terrain 地形', () => {
  it('同一回调内先建 DEM 源再 setTerrain；卸载清地形并移除源', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value ? h(MapboxTerrain, { exaggeration: 1.5 }) : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.sources.has('movk-terrain-dem')).toBe(true)
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
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value ? h(MapboxTerrain) : null)
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
