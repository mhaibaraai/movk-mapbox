import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreSky from '../src/runtime/components/environment/Sky.vue'
import MaplibreTerrain from '../src/runtime/components/environment/Terrain.vue'
import MaplibreProjection from '../src/runtime/components/environment/Projection.vue'
import MaplibreGlobeControl from '../src/runtime/components/controls/GlobeControl.vue'
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
      projection: undefined as unknown,
      projectionCalls: [] as unknown[],
      controls: [] as { control: unknown, position: unknown }[],
      setTilesCalls: [] as unknown[],
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
      getProjection: () => self.projection,
      setProjection(value: unknown) {
        self.checkLoaded()
        self.projectionCalls.push(value)
        self.projection = value
      },
      addControl(control: unknown, position?: unknown) {
        self.controls.push({ control, position })
      },
      removeControl(control: unknown) {
        self.controls = self.controls.filter(item => item.control !== control)
      },
      getSource: (id: string) => (sources.has(id)
        ? { setUrl() {}, setTiles(tiles: unknown) { self.setTilesCalls.push(tiles) } }
        : undefined),
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
  function FakeGlobeControl(this: { kind: string }) {
    this.kind = 'globe'
  }
  return {
    Map: FakeGlMap,
    GlobeControl: FakeGlobeControl,
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

  it('source 变化时经 setTiles 原地更新 DEM 源', async () => {
    const source = ref(DEM)
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { options: {} }, {
          default: () => h(MaplibreTerrain, { source: source.value })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    const tiles = ['https://example.com/dem-v2/{z}/{x}/{y}.png']
    source.value = { ...DEM, tiles }
    await nextTick()
    expect(map.setTilesCalls).toEqual([tiles])
    expect(map.sourceSpecs).toHaveLength(1)
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

function mountWith(child: () => ReturnType<typeof h> | null) {
  const Parent = defineComponent({
    setup() {
      return () => h(MaplibreMap, { options: {} }, { default: child })
    }
  })
  mount(Parent)
  return maps[maps.length - 1]!
}

const ZOOM_TRANSITION = ['interpolate', ['linear'], ['zoom'], 10, 'vertical-perspective', 12, 'mercator']

describe('Projection 投影', () => {
  it('缺省下发 globe', () => {
    const map = mountWith(() => h(MaplibreProjection))
    map.fire('style.load')
    expect(map.projectionCalls).toEqual([{ type: 'globe' }])
  })

  it('type 与插值表达式原样下发', () => {
    const map = mountWith(() => h(MaplibreProjection, { type: 'vertical-perspective' }))
    map.fire('style.load')
    expect(map.projectionCalls).toEqual([{ type: 'vertical-perspective' }])

    const exprMap = mountWith(() => h(MaplibreProjection, { type: ZOOM_TRANSITION as never }))
    exprMap.fire('style.load')
    expect(exprMap.projectionCalls).toEqual([{ type: ZOOM_TRANSITION }])
  })

  it('options 优先于 type', () => {
    const map = mountWith(() => h(MaplibreProjection, { type: 'mercator', options: { type: 'globe' } }))
    map.fire('style.load')
    expect(map.projectionCalls).toEqual([{ type: 'globe' }])
  })

  it('type 变化重新下发，内容相同的新表达式不重复下发', async () => {
    const type = ref<unknown>('globe')
    const map = mountWith(() => h(MaplibreProjection, { type: type.value as never }))
    map.fire('style.load')

    type.value = 'mercator'
    await nextTick()
    expect(map.projectionCalls).toEqual([{ type: 'globe' }, { type: 'mercator' }])

    type.value = [...ZOOM_TRANSITION]
    await nextTick()
    type.value = [...ZOOM_TRANSITION]
    await nextTick()
    expect(map.projectionCalls).toHaveLength(3)
  })

  it('卸载还原样式自带的投影', async () => {
    const show = ref(true)
    const map = mountWith(() => (show.value ? h(MaplibreProjection, { type: 'mercator' }) : null))
    map.projection = { type: 'globe' }
    map.fire('style.load')
    expect(map.projection).toEqual({ type: 'mercator' })

    show.value = false
    await nextTick()
    expect(map.projection).toEqual({ type: 'globe' })
  })

  it('样式未声明投影时卸载还原为 mercator', async () => {
    const show = ref(true)
    const map = mountWith(() => (show.value ? h(MaplibreProjection) : null))
    map.fire('style.load')

    show.value = false
    await nextTick()
    expect(map.projectionCalls).toEqual([{ type: 'globe' }, { type: 'mercator' }])
  })

  it('setStyle 后重新记录原值并重新覆盖', async () => {
    const show = ref(true)
    const map = mountWith(() => (show.value ? h(MaplibreProjection) : null))
    map.fire('style.load')

    // 模拟新样式自带 vertical-perspective
    map.projection = { type: 'vertical-perspective' }
    map.fire('style.load')
    expect(map.projection).toEqual({ type: 'globe' })

    show.value = false
    await nextTick()
    expect(map.projection).toEqual({ type: 'vertical-perspective' })
  })

  it('样式未加载完时变更与卸载不抛错，style.load 后以最新值恢复', async () => {
    const type = ref('globe')
    const show = ref(true)
    const map = mountWith(() => (show.value ? h(MaplibreProjection, { type: type.value as never }) : null))
    map.fire('style.load')

    map.styleLoaded = false
    type.value = 'vertical-perspective'
    await expect(nextTick()).resolves.toBeUndefined()
    expect(map.projectionCalls).toHaveLength(1)

    map.styleLoaded = true
    map.fire('style.load')
    expect(map.projection).toEqual({ type: 'vertical-perspective' })

    map.styleLoaded = false
    show.value = false
    await expect(nextTick()).resolves.toBeUndefined()
  })
})

describe('GlobeControl 投影切换控件', () => {
  it('挂载即 addControl，position 变化重建，卸载移除', async () => {
    const show = ref(true)
    const position = ref('top-right')
    const map = mountWith(() => (show.value ? h(MaplibreGlobeControl, { position: position.value as never }) : null))
    await nextTick()
    expect(map.controls).toHaveLength(1)
    expect(map.controls[0]).toMatchObject({ control: { kind: 'globe' }, position: 'top-right' })

    const first = map.controls[0]!.control
    position.value = 'bottom-left'
    await nextTick()
    expect(map.controls).toHaveLength(1)
    expect(map.controls[0]!.position).toBe('bottom-left')
    expect(map.controls[0]!.control).not.toBe(first)

    show.value = false
    await nextTick()
    expect(map.controls).toHaveLength(0)
  })
})
