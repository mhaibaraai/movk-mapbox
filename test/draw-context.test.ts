import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { Feature } from 'geojson'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreDrawControl from '../src/runtime/components/extensions/DrawControl.vue'
import { getDrawContext } from '../src/runtime/domains/map/draw-registry'
import { useMaplibreDraw } from '../src/runtime/composables/useMaplibreDraw'
import { logger } from '../src/runtime/utils/logger'
import { draws } from './fixtures/fake-terra-draw'
import type { FakeTerraDraw } from './fixtures/fake-terra-draw'

// 可手动 fire 事件的最小 fake gl Map
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const self = {
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
      addControl() {},
      removeControl() {},
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

vi.mock('terra-draw', async importOriginal => ({
  ...(await importOriginal<typeof import('terra-draw')>()),
  TerraDraw: (await import('./fixtures/fake-terra-draw')).FakeTerraDraw
}))

vi.mock('terra-draw-maplibre-gl-adapter', async () => ({
  TerraDrawMapLibreGLAdapter: (await import('./fixtures/fake-terra-draw')).FakeMapLibreGLAdapter
}))

const pointFeature: Feature = {
  type: 'Feature',
  id: 'f1',
  properties: {},
  geometry: { type: 'Point', coordinates: [116.39, 39.91] }
}

function lastDraw(): FakeTerraDraw {
  return draws[draws.length - 1]!
}

/** 挂载 MaplibreMap + DrawControl；load 未触发时绘制实例尚未创建 */
function mountControl(mapId: string) {
  const features = ref<Feature[]>([])
  const mode = ref<string>()
  const Parent = defineComponent({
    setup() {
      return () => h(MaplibreMap, { mapId, options: {} }, {
        default: () => h(MaplibreDrawControl, {
          'features': features.value,
          'onUpdate:features': (v: Feature[]) => {
            features.value = v
          },
          'mode': mode.value,
          'onUpdate:mode': (v: string) => {
            mode.value = v
          }
        })
      })
    }
  })
  const wrapper = mount(Parent)
  const map = maps[maps.length - 1]!
  return { wrapper, map, features, mode }
}

/** fire load 并等待 whenLoaded 的微任务续体执行完成 */
async function load(map: { fire: (type: string) => void }) {
  map.fire('load')
  await nextTick()
  await nextTick()
}

beforeEach(() => {
  maps.length = 0
  draws.length = 0
  vi.restoreAllMocks()
})

describe('draw 注册表', () => {
  it('控件挂载后按 mapId 可取到上下文，卸载后取不到', async () => {
    const { wrapper, map } = mountControl('m1')
    expect(getDrawContext('m1')).toBeDefined()

    await load(map)
    expect(getDrawContext('m1')?.draw.value).toBe(lastDraw())

    wrapper.unmount()
    expect(getDrawContext('m1')).toBeUndefined()
  })

  it('同一 mapId 重复注册时后者生效，旧控件卸载不删新注册', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const first = mountControl('m2')
    const firstContext = getDrawContext('m2')

    const second = mountControl('m2')
    const secondContext = getDrawContext('m2')

    expect(warn).toHaveBeenCalledTimes(1)
    expect(secondContext).not.toBe(firstContext)

    first.wrapper.unmount()
    expect(getDrawContext('m2')).toBe(secondContext)

    second.wrapper.unmount()
    expect(getDrawContext('m2')).toBeUndefined()
  })
})

describe('跨树 useMaplibreDraw({ mapId })', () => {
  it('changeMode 切换实例模式并回写 v-model:mode', async () => {
    const { map, mode } = mountControl('m3')
    await load(map)

    const { changeMode } = useMaplibreDraw({ mapId: 'm3' })
    await changeMode('polygon')
    await nextTick()

    expect(lastDraw().mode).toBe('polygon')
    expect(mode.value).toBe('polygon')
  })

  it('deleteAll 清空实例并回写 v-model:features', async () => {
    const { map, features } = mountControl('m4')
    await load(map)

    features.value = [pointFeature]
    await nextTick()
    expect(lastDraw().store).toHaveLength(1)

    const { deleteAll } = useMaplibreDraw({ mapId: 'm4' })
    await deleteAll()
    await nextTick()

    expect(lastDraw().store).toHaveLength(0)
    expect(features.value).toEqual([])
  })

  it('add 追加要素并回写 v-model:features', async () => {
    const { map, features } = mountControl('m5')
    await load(map)

    const { add } = useMaplibreDraw({ mapId: 'm5' })
    const ids = await add(pointFeature)
    await nextTick()

    expect(ids).toEqual(['f1'])
    expect(features.value).toHaveLength(1)
    // 缺省 mode 按几何类型推断
    expect(features.value[0]!.properties).toMatchObject({ mode: 'point' })
  })

  it('add 接受裸几何与 FeatureCollection，缺失 id 时生成', async () => {
    const { map } = mountControl('m5b')
    await load(map)

    const { add } = useMaplibreDraw({ mapId: 'm5b' })
    const [polygonId] = await add({ type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] })
    const lineIds = await add({
      type: 'FeatureCollection',
      features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] } }]
    })

    expect(polygonId).toMatch(/^generated-/)
    expect(lineIds).toHaveLength(1)
    expect(lastDraw().store.map(f => f.properties.mode)).toEqual(['polygon', 'linestring'])
  })

  it('add 跳过不支持的几何与校验失败的要素并告警', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const { map } = mountControl('m5c')
    await load(map)

    const { add } = useMaplibreDraw({ mapId: 'm5c' })
    const ids = await add({ type: 'MultiPoint', coordinates: [[0, 0]] })

    expect(ids).toEqual([])
    expect(lastDraw().store).toHaveLength(0)
    expect(warn).toHaveBeenCalled()
  })

  it('setFeatureProperty 更新要素属性并回写 v-model:features', async () => {
    const { map, features } = mountControl('m5d')
    await load(map)

    const { add, setFeatureProperty } = useMaplibreDraw({ mapId: 'm5d' })
    await add(pointFeature)
    await setFeatureProperty('f1', 'color', '#ff0000')
    await nextTick()

    expect(features.value[0]!.properties).toMatchObject({ color: '#ff0000' })
  })

  it('getAll 排除绘制中的要素与辅助点', async () => {
    const { map } = mountControl('m5e')
    await load(map)
    const draw = lastDraw()
    draw.store = [
      { ...pointFeature, id: 'done', properties: { mode: 'point' } },
      { ...pointFeature, id: 'drawing', properties: { mode: 'polygon', currentlyDrawing: true } },
      { ...pointFeature, id: 'closing', properties: { mode: 'polygon', closingPoint: true } },
      { ...pointFeature, id: 'selection', properties: { mode: 'select', selectionPoint: true } }
    ] as FakeTerraDraw['store']

    const { getAll } = useMaplibreDraw({ mapId: 'm5e' })
    expect(getAll()?.features.map(f => f.id)).toEqual(['done'])
  })

  it('读操作在就绪前返回 undefined，就绪后返回现值', async () => {
    const { map } = mountControl('m6')
    const { getAll, getMode } = useMaplibreDraw({ mapId: 'm6' })

    expect(getAll()).toBeUndefined()
    expect(getMode()).toBeUndefined()

    await load(map)
    expect(getMode()).toBe('select')
    expect(getAll()?.features).toEqual([])
  })

  it('whenReady 在地图 load 前 pending、load 后 resolve 到实例', async () => {
    const { map } = mountControl('m7')
    const { whenReady } = useMaplibreDraw({ mapId: 'm7' })

    let resolved: unknown
    whenReady().then((d) => {
      resolved = d
    })
    await nextTick()
    expect(resolved).toBeUndefined()

    await load(map)
    await nextTick()
    expect(resolved).toBe(lastDraw())
  })

  it('写操作在实例就绪前调用，会等到就绪后执行', async () => {
    const { map, mode } = mountControl('m8')
    const { changeMode } = useMaplibreDraw({ mapId: 'm8' })

    const pending = changeMode('point')
    await load(map)
    await pending
    await nextTick()

    expect(lastDraw().mode).toBe('point')
    expect(mode.value).toBe('point')
  })

  it('未注册的 mapId：写操作 warn 且不抛，whenReady reject', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const { changeMode, getAll, whenReady } = useMaplibreDraw({ mapId: 'absent' })

    await expect(changeMode('point')).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(getAll()).toBeUndefined()
    await expect(whenReady()).rejects.toThrow(/absent/)
  })
})

describe('子树内 useMaplibreDraw()', () => {
  it('无参调用注入同一上下文', async () => {
    let injected: unknown
    const Child = defineComponent({
      setup() {
        injected = useMaplibreDraw()
        return () => null
      }
    })
    const Parent = defineComponent({
      setup() {
        return () => h(MaplibreMap, { mapId: 'm9', options: {} }, {
          default: () => h(MaplibreDrawControl, null, { default: () => h(Child) })
        })
      }
    })
    mount(Parent)
    expect(injected).toBe(getDrawContext('m9'))
  })

  it('在 MaplibreDrawControl 外无参调用抛错', () => {
    const Child = defineComponent({
      setup() {
        useMaplibreDraw()
        return () => null
      }
    })
    expect(() => mount(Child)).toThrow(/MaplibreDrawControl/)
  })
})
