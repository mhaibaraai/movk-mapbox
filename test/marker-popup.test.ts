import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxMarker from '../src/runtime/components/Marker.vue'

const { maps, markers, popups, makeFakeMap } = vi.hoisted(() => {
  interface FakeMarkerLike { element: HTMLElement }
  interface FakePopupLike { opened: boolean }
  const maps: ReturnType<typeof makeFakeMap>[] = []
  const markers: FakeMarkerLike[] = []
  const popups: FakePopupLike[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    // 还原真实结构：marker 元素挂在 canvasContainer 内，其 DOM click 冒泡后
    // mapbox 依次 fire('preclick') / fire('click')，preclick 会关闭 closeOnClick 的 popup
    const canvasContainer = document.createElement('div')
    document.body.appendChild(canvasContainer)
    const fired: string[] = []
    const self = {
      canvasContainer,
      fired,
      on(type: string, a: unknown, b?: unknown) {
        ;(handlers[type] ??= new Set()).add((b ?? a) as (e?: unknown) => void)
      },
      off(type: string, a: unknown, b?: unknown) {
        handlers[type]?.delete((b ?? a) as (e?: unknown) => void)
      },
      fire(type: string, e?: unknown) {
        fired.push(type)
        handlers[type]?.forEach(fn => fn(e))
      },
      isStyleLoaded: () => true,
      resize() {},
      remove() {},
      getCanvasContainer: () => canvasContainer,
      getCenter: () => ({ lng: 0, lat: 0 }),
      getZoom: () => 1,
      getBearing: () => 0,
      getPitch: () => 0,
      setStyle() {}
    }
    canvasContainer.addEventListener('click', () => {
      self.fire('preclick')
      self.fire('click')
    })
    maps.push(self)
    return self
  }
  return { maps, markers, popups, makeFakeMap }
})

vi.mock('mapbox-gl', () => {
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  interface FakeMapLike {
    getCanvasContainer: () => HTMLElement
    on: (type: string, a: unknown, b?: unknown) => void
    off: (type: string, a: unknown, b?: unknown) => void
  }
  class FakeMarker {
    element: HTMLElement
    constructor(options: { element?: HTMLElement } = {}) {
      this.element = options.element ?? document.createElement('div')
      markers.push(this)
    }

    setLngLat() { return this }
    addTo(map: FakeMapLike) {
      map.getCanvasContainer().appendChild(this.element)
      return this
    }

    on() {}
    remove() {}
    getElement() { return this.element }
    getLngLat() { return { lng: 0, lat: 0 } }
  }
  class FakePopup {
    opened = false
    private map?: FakeMapLike
    private listeners: Record<string, Set<() => void>> = {}
    constructor(public options: Record<string, unknown> = {}) {
      popups.push(this)
    }

    private onClose = () => this.remove()

    setLngLat() { return this }
    setDOMContent() { return this }
    addTo(map: FakeMapLike) {
      this.opened = true
      this.map = map
      // mapbox 默认 closeOnClick: true，绑定在 map 的 preclick 上
      if (this.options.closeOnClick !== false) map.on('preclick', this.onClose)
      return this
    }

    remove() {
      if (this.opened) {
        this.opened = false
        this.map?.off('preclick', this.onClose)
        this.listeners.close?.forEach(fn => fn())
      }
      return this
    }

    on(type: string, fn: () => void) { (this.listeners[type] ??= new Set()).add(fn) }
    isOpen() { return this.opened }
  }
  return {
    default: { Map: FakeGlMap, accessToken: '', prewarm() {}, setRTLTextPlugin() {} },
    LngLat: { convert: (v: unknown) => v },
    Marker: FakeMarker,
    Popup: FakePopup
  }
})

/** 挂载一个 MapboxMap，其内渲染 children，并把地图置为 loaded */
async function mountMap(children: () => unknown) {
  const Parent = defineComponent({
    setup() {
      return () => h(MapboxMap, { options: {} }, { default: children })
    }
  })
  const wrapper = mount(Parent, { attachTo: document.body })
  maps[maps.length - 1]!.fire('load')
  await nextTick()
  await nextTick()
  return wrapper
}

const card = () => h('div', { 'data-test': 'card' }, 'card')

function clickMarker(index = 0) {
  markers[index]!.element.dispatchEvent(new MouseEvent('click', { bubbles: true }))
}

function hasCard(wrapper: { find: (s: string) => { exists: () => boolean } }) {
  return wrapper.find('[data-test="card"]').exists()
}

describe('MapboxMarker 弹窗', () => {
  beforeEach(() => {
    maps.length = 0
    markers.length = 0
    popups.length = 0
  })

  it('无 #popup 插槽时不创建 popup，点击照常冒泡到地图', async () => {
    const wrapper = await mountMap(() => h(MapboxMarker, { lnglat: [0, 0] }, { default: () => h('div', 'pin') }))

    expect(popups).toHaveLength(0)
    clickMarker()
    await nextTick()
    expect(popups).toHaveLength(0)
    // 未接管弹窗的 marker 不应吞掉地图点击
    expect(maps[0]!.fired).toContain('click')
    wrapper.unmount()
  })

  // 回归：点击若冒泡到地图，mapbox 的 preclick 会立刻触发 closeOnClick，
  // 把刚在微任务检查点里挂载好的 popup 当场关闭，表现为“点了没反应”
  it('trigger=click 时点击 marker 不冒泡到地图，避免 preclick 自关闭', async () => {
    const wrapper = await mountMap(() =>
      h(MapboxMarker, { lnglat: [0, 0] }, { default: () => h('div', 'pin'), popup: card })
    )

    clickMarker()
    await nextTick()

    expect(hasCard(wrapper)).toBe(true)
    expect(maps[0]!.fired).not.toContain('preclick')
    expect(maps[0]!.fired).not.toContain('click')
    wrapper.unmount()
  })

  it('地图上的 preclick 关闭 popup 时，open 同步复位', async () => {
    const wrapper = await mountMap(() =>
      h(MapboxMarker, { lnglat: [0, 0], open: true }, { default: () => h('div', 'pin'), popup: card })
    )
    expect(hasCard(wrapper)).toBe(true)

    // 用户点击地图空白处
    maps[0]!.fire('preclick')
    await nextTick()
    expect(hasCard(wrapper)).toBe(false)
    wrapper.unmount()
  })

  it('trigger=click 时点击 marker 开合弹窗（toggle）', async () => {
    const wrapper = await mountMap(() =>
      h(MapboxMarker, { lnglat: [0, 0] }, { default: () => h('div', 'pin'), popup: card })
    )

    expect(hasCard(wrapper)).toBe(false)

    clickMarker()
    await nextTick()
    expect(hasCard(wrapper)).toBe(true)

    clickMarker()
    await nextTick()
    expect(hasCard(wrapper)).toBe(false)
    wrapper.unmount()
  })

  it('trigger=hover 时 mouseenter 开、mouseleave 关', async () => {
    const wrapper = await mountMap(() =>
      h(MapboxMarker, { lnglat: [0, 0], trigger: 'hover' }, { default: () => h('div', 'pin'), popup: card })
    )
    const el = markers[0]!.element

    el.dispatchEvent(new MouseEvent('mouseenter'))
    await nextTick()
    expect(hasCard(wrapper)).toBe(true)

    el.dispatchEvent(new MouseEvent('mouseleave'))
    await nextTick()
    expect(hasCard(wrapper)).toBe(false)
    wrapper.unmount()
  })

  it('trigger=none 时不绑定监听，仅 v-model:open 生效', async () => {
    const open = ref(false)
    const wrapper = await mountMap(() =>
      h(
        MapboxMarker,
        { 'lnglat': [0, 0], 'trigger': 'none', 'open': open.value, 'onUpdate:open': (v: boolean) => (open.value = v) },
        { default: () => h('div', 'pin'), popup: card }
      )
    )

    clickMarker()
    await nextTick()
    expect(hasCard(wrapper)).toBe(false)

    open.value = true
    await nextTick()
    expect(hasCard(wrapper)).toBe(true)
    wrapper.unmount()
  })

  it('静态 :open="true" 初始即展开，且仍可 click 关闭', async () => {
    const wrapper = await mountMap(() =>
      h(MapboxMarker, { lnglat: [0, 0], open: true }, { default: () => h('div', 'pin'), popup: card })
    )

    expect(hasCard(wrapper)).toBe(true)

    clickMarker()
    await nextTick()
    expect(hasCard(wrapper)).toBe(false)
    wrapper.unmount()
  })

  it('一组 marker 同时默认展开且互不影响', async () => {
    const points = [[0, 0], [1, 1], [2, 2]]
    const wrapper = await mountMap(() =>
      points.map((lnglat, i) =>
        h(MapboxMarker, { key: i, lnglat, open: true }, {
          default: () => h('div', 'pin'),
          popup: () => h('div', { 'data-test': 'card' }, `card-${i}`)
        })
      )
    )

    expect(wrapper.findAll('[data-test="card"]')).toHaveLength(3)

    clickMarker(0)
    await nextTick()
    expect(wrapper.findAll('[data-test="card"]')).toHaveLength(2)
    wrapper.unmount()
  })
})
