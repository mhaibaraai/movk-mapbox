import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { Feature } from 'geojson'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxDrawControl from '../src/runtime/components/extensions/DrawControl.vue'

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

// fake MapboxDraw：记录 set/changeMode 调用
const { draws } = vi.hoisted(() => {
  const draws: unknown[] = []
  return { draws }
})

vi.mock('@mapbox/mapbox-gl-draw', () => {
  class FakeDraw {
    store: Feature[] = []
    mode = 'simple_select'
    setCalls = 0
    changeModeCalls = 0
    constructor() {
      draws.push(this)
    }

    set(fc: { features: Feature[] }) {
      this.setCalls++
      this.store = [...fc.features]
      return this.store.map(f => String(f.id))
    }

    getAll() {
      return { type: 'FeatureCollection', features: [...this.store] }
    }

    getMode() {
      return this.mode
    }

    changeMode(mode: string) {
      this.changeModeCalls++
      this.mode = mode
    }

    deleteAll() {
      this.store = []
      return this
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
  setCalls: number
  changeModeCalls: number
}

const pointFeature: Feature = {
  type: 'Feature',
  id: 'f1',
  properties: {},
  geometry: { type: 'Point', coordinates: [116.39, 39.91] }
}

async function mountControlled() {
  const features = ref<Feature[]>([])
  const mode = ref<string>()
  const Parent = defineComponent({
    setup() {
      return () => h(MapboxMap, { options: {} }, {
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
  // whenLoaded 在 load 事件后 resolve，等微任务续体执行完成
  map.fire('load')
  await nextTick()
  await nextTick()
  const draw = draws[draws.length - 1] as FakeDrawInstance
  return { wrapper, map, draw, features, mode }
}

describe('DrawControl 受控 features', () => {
  it('绘制事件回写模型且不回流 draw.set（断环）', async () => {
    const { map, draw, features } = await mountControlled()

    draw.store = [pointFeature]
    map.fire('draw.create', { features: [pointFeature] })
    await nextTick()

    expect(features.value).toHaveLength(1)
    // 回写签名与模型一致，watch 比对相等跳过 set
    expect(draw.setCalls).toBe(0)
  })

  it('外部赋值经 draw.set 下发', async () => {
    const { draw, features } = await mountControlled()

    features.value = [pointFeature]
    await nextTick()

    expect(draw.setCalls).toBe(1)
    expect(draw.store).toHaveLength(1)
  })
})

describe('DrawControl 受控 mode', () => {
  it('modechange 回写模型；外部赋值触发 changeMode', async () => {
    const { map, draw, mode } = await mountControlled()
    // 挂载后回写默认模式
    expect(mode.value).toBe('simple_select')

    // 用户交互切换：实例已处于新模式后才派发 modechange
    draw.mode = 'draw_polygon'
    map.fire('draw.modechange', { mode: 'draw_polygon' })
    await nextTick()
    expect(mode.value).toBe('draw_polygon')
    // 回写值与实例现值一致，watch 比对相等跳过程序式 changeMode
    expect(draw.changeModeCalls).toBe(0)

    draw.mode = 'simple_select'
    mode.value = 'draw_point'
    await nextTick()
    expect(draw.changeModeCalls).toBe(1)
    expect(draw.mode).toBe('draw_point')
  })
})
