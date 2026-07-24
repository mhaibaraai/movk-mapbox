import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxLayer from '../src/runtime/components/Layer.vue'
import MapboxTiandituLayer from '../src/runtime/components/extensions/TiandituLayer.vue'
import { useMap } from '../src/runtime/composables/useMap'

// 富功能 fake gl Map：记录 addLayer 次数、图层级 on 绑定次数，并可手动 fire 事件
const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const layers = new Set<string>()
    const sources = new Set<string>()
    const center = { lng: 0, lat: 0 }
    const self = {
      layers,
      addLayerCalls: 0,
      layerOnCalls: 0,
      setCenterCalls: 0,
      setTilesCalls: 0,
      styleLoaded: true,
      on(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        if (b) self.layerOnCalls++
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
      addLayer: (spec: { id: string }) => {
        layers.add(spec.id)
        self.addLayerCalls++
      },
      removeLayer: (id: string) => layers.delete(id),
      getSource: (id: string) =>
        sources.has(id) ? { setData() {}, setUrl() {}, setTiles() { self.setTilesCalls++ }, updateImage() {} } : undefined,
      addSource: (id: string) => sources.add(id),
      removeSource: (id: string) => sources.delete(id),
      resize() {},
      remove() {},
      getCenter: () => ({ ...center }),
      getZoom: () => 1,
      getBearing: () => 0,
      getPitch: () => 0,
      // 模拟 jumpTo：写入并同步派发 moveend（用于验证相机回环已断）
      setCenter(v: [number, number]) {
        self.setCenterCalls++
        center.lng = v[0]
        center.lat = v[1]
        self.fire('moveend')
      },
      setZoom() {},
      setBearing() {},
      setPitch() {},
      setStyle() {},
      addControl() {},
      removeControl() {}
    }
    maps.push(self)
    return self
  }
  return { maps, makeFakeMap }
})

vi.mock('mapbox-gl', () => {
  // 函数构造器：new FakeGlMap() 返回 makeFakeMap() 生成的桩对象
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  function Noop() {}
  const LngLat = {
    convert: (v: unknown) => (Array.isArray(v)
      ? { lng: v[0], lat: v[1] }
      : v as { lng: number, lat: number })
  }
  return {
    default: { Map: FakeGlMap, accessToken: '', prewarm() {}, setRTLTextPlugin() {} },
    LngLat,
    Marker: Noop,
    Popup: Noop
  }
})

const inlineSource = { type: 'geojson', data: { type: 'FeatureCollection', features: [] } } as const

describe('F1 Map id 唯一性', () => {
  it('同一应用内多张地图自动 id 互不相同', () => {
    const ids: string[] = []
    const Child = defineComponent({
      setup() {
        ids.push(useMap().id)
        return () => h('div')
      }
    })
    const Parent = defineComponent({
      setup() {
        return () => h('div', [
          h(MapboxMap, { options: {} }, { default: () => h(Child) }),
          h(MapboxMap, { options: {} }, { default: () => h(Child) })
        ])
      }
    })
    mount(Parent)
    expect(ids).toHaveLength(2)
    expect(ids[0]).not.toBe(ids[1])
  })
})

describe('F2 Layer 卸载后不再响应 style.load', () => {
  it('卸载后再次 style.load 不重复加图层、不重复绑事件', async () => {
    const show = ref(true)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value
            ? h(MapboxLayer, { layerId: 'l', type: 'circle', source: inlineSource })
            : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.addLayerCalls).toBe(1)
    const onCallsAfterMount = map.layerOnCalls
    expect(onCallsAfterMount).toBeGreaterThan(0)

    show.value = false
    await nextTick()
    map.fire('style.load')
    expect(map.addLayerCalls).toBe(1)
    expect(map.layerOnCalls).toBe(onCallsAfterMount)
  })
})

describe('F3 TiandituLayer 切换类型', () => {
  it('切换 layer 类型时原地更新瓦片，不重建图层', async () => {
    const layer = ref<'vec' | 'img'>('vec')
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxTiandituLayer, { layer: layer.value, tk: 'test' })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.layers.has('tianditu-base')).toBe(true)
    const addLayerCallsAfterMount = map.addLayerCalls

    layer.value = 'img'
    await nextTick()
    // 稳定 id：图层始终存在，未触发重建
    expect(map.layers.has('tianditu-base')).toBe(true)
    expect(map.addLayerCalls).toBe(addLayerCallsAfterMount)
    // 通过 setTiles 原地切换瓦片
    expect(map.setTilesCalls).toBeGreaterThan(0)
  })

  it('annotation 时叠加注记图层', async () => {
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxTiandituLayer, { layer: 'img', annotation: true, tk: 'test' })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!

    map.fire('style.load')
    expect(map.layers.has('tianditu-base')).toBe(true)
    expect(map.layers.has('tianditu-annotation')).toBe(true)
  })
})

describe('F4 onReady：load 后样式瞬时未就绪时经 styledata 补建', () => {
  it('挂载于 isStyleLoaded() 为 false 时，待样式就绪后补建图层', async () => {
    const show = ref(false)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => (show.value
            ? h(MapboxLayer, { layerId: 'late', type: 'circle', source: inlineSource })
            : null)
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    // 初次加载后样式瞬时未就绪：此刻挂载的组件不能立即建层
    map.styleLoaded = false
    show.value = true
    await nextTick()
    expect(map.layers.has('late')).toBe(false)

    // 样式仍未就绪：styledata 不补建
    map.fire('styledata')
    expect(map.layers.has('late')).toBe(false)

    // 样式就绪后 styledata 触发补建
    map.styleLoaded = true
    map.fire('styledata')
    expect(map.layers.has('late')).toBe(true)
  })
})

describe('相机回环', () => {
  it('moveend 回写后 watcher 比对相等，不再递归调用 setCenter', async () => {
    const wrapper = mount(MapboxMap, { props: { center: [0, 0] } as never })
    const map = maps[maps.length - 1]!

    // 模拟一次地图移动结束：回写模型 → watcher 触发
    map.fire('moveend')
    await nextTick()
    await nextTick()

    // 回写值与地图现值一致，watcher 比对相等跳过下发；不形成 moveend→setCenter→moveend 回环
    expect(map.setCenterCalls).toBe(0)
    wrapper.unmount()
  })
})

describe('hideLogo', () => {
  it('随 prop 增删根节点状态类', async () => {
    const wrapper = mount(MapboxMap, { props: { hideLogo: true } as never, attrs: { class: 'h-115' } })
    // 状态类与 $attrs 透传的 class 合并共存
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['movk-mapbox', 'movk-mapbox--hide-logo', 'h-115']))

    await wrapper.setProps({ hideLogo: false } as never)
    expect(wrapper.classes()).not.toContain('movk-mapbox--hide-logo')
    wrapper.unmount()
  })
})
