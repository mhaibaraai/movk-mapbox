import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { Feature } from 'geojson'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxDrawControl from '../src/runtime/components/extensions/DrawControl.vue'
import { getDrawContext } from '../src/runtime/domains/map/draw-registry'
import { useMapboxDraw } from '../src/runtime/composables/useMapboxDraw'
import { logger } from '../src/runtime/utils/logger'

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

const { draws } = vi.hoisted(() => {
  const draws: unknown[] = []
  return { draws }
})

vi.mock('@mapbox/mapbox-gl-draw', () => {
  class FakeDraw {
    store: Feature[] = []
    mode = 'simple_select'
    constructor() {
      draws.push(this)
    }

    set(fc: { features: Feature[] }) {
      this.store = [...fc.features]
      return this.store.map(f => String(f.id))
    }

    add(geojson: Feature) {
      this.store = [...this.store, geojson]
      return [String(geojson.id)]
    }

    get(id: string) {
      return this.store.find(f => String(f.id) === id)
    }

    getAll() {
      return { type: 'FeatureCollection', features: [...this.store] }
    }

    getMode() {
      return this.mode
    }

    changeMode(mode: string) {
      this.mode = mode
    }

    deleteAll() {
      this.store = []
      return this
    }

    setFeatureProperty(featureId: string, property: string, value: unknown) {
      this.store = this.store.map(f =>
        String(f.id) === featureId ? { ...f, properties: { ...f.properties, [property]: value } } : f
      )
    }

    onAdd() {
      return document.createElement('div')
    }

    onRemove() {}
  }
  return { default: FakeDraw }
})

interface FakeDrawInstance {
  store: Feature[]
  mode: string
}

const pointFeature: Feature = {
  type: 'Feature',
  id: 'f1',
  properties: {},
  geometry: { type: 'Point', coordinates: [116.39, 39.91] }
}

function lastDraw(): FakeDrawInstance {
  return draws[draws.length - 1] as FakeDrawInstance
}

/** 挂载 MapboxMap + DrawControl；load 未触发时绘制实例尚未创建 */
function mountControl(mapId: string) {
  const features = ref<Feature[]>([])
  const mode = ref<string>()
  const Parent = defineComponent({
    setup() {
      return () => h(MapboxMap, { mapId, options: {} }, {
        default: () => h(MapboxDrawControl, {
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

describe('跨树 useMapboxDraw({ mapId })', () => {
  it('changeMode 切换实例模式并回写 v-model:mode', async () => {
    const { map, mode } = mountControl('m3')
    await load(map)

    const { changeMode } = useMapboxDraw({ mapId: 'm3' })
    await changeMode('draw_polygon')
    await nextTick()

    expect(lastDraw().mode).toBe('draw_polygon')
    expect(mode.value).toBe('draw_polygon')
  })

  it('deleteAll 清空实例并回写 v-model:features', async () => {
    const { map, features } = mountControl('m4')
    await load(map)

    features.value = [pointFeature]
    await nextTick()
    expect(lastDraw().store).toHaveLength(1)

    const { deleteAll } = useMapboxDraw({ mapId: 'm4' })
    await deleteAll()
    await nextTick()

    expect(lastDraw().store).toHaveLength(0)
    expect(features.value).toEqual([])
  })

  it('add 追加要素并回写 v-model:features', async () => {
    const { map, features } = mountControl('m5')
    await load(map)

    const { add } = useMapboxDraw({ mapId: 'm5' })
    const ids = await add(pointFeature)
    await nextTick()

    expect(ids).toEqual(['f1'])
    expect(features.value).toHaveLength(1)
  })

  it('读操作在就绪前返回 undefined，就绪后返回现值', async () => {
    const { map } = mountControl('m6')
    const { getAll, getMode } = useMapboxDraw({ mapId: 'm6' })

    expect(getAll()).toBeUndefined()
    expect(getMode()).toBeUndefined()

    await load(map)
    expect(getMode()).toBe('simple_select')
    expect(getAll()?.features).toEqual([])
  })

  it('whenReady 在地图 load 前 pending、load 后 resolve 到实例', async () => {
    const { map } = mountControl('m7')
    const { whenReady } = useMapboxDraw({ mapId: 'm7' })

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
    const { changeMode } = useMapboxDraw({ mapId: 'm8' })

    const pending = changeMode('draw_point')
    await load(map)
    await pending
    await nextTick()

    expect(lastDraw().mode).toBe('draw_point')
    expect(mode.value).toBe('draw_point')
  })

  it('未注册的 mapId：写操作 warn 且不抛，whenReady reject', async () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const { changeMode, getAll, whenReady } = useMapboxDraw({ mapId: 'absent' })

    await expect(changeMode('draw_point')).resolves.toBeUndefined()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(getAll()).toBeUndefined()
    await expect(whenReady()).rejects.toThrow(/absent/)
  })
})

describe('子树内 useMapboxDraw()', () => {
  it('无参调用注入同一上下文', async () => {
    let injected: unknown
    const Child = defineComponent({
      setup() {
        injected = useMapboxDraw()
        return () => null
      }
    })
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { mapId: 'm9', options: {} }, {
          default: () => h(MapboxDrawControl, null, { default: () => h(Child) })
        })
      }
    })
    mount(Parent)
    expect(injected).toBe(getDrawContext('m9'))
  })

  it('在 MapboxDrawControl 外无参调用抛错', () => {
    const Child = defineComponent({
      setup() {
        useMapboxDraw()
        return () => null
      }
    })
    expect(() => mount(Child)).toThrow(/MapboxDrawControl/)
  })
})
