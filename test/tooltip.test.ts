import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxTooltip from '../src/runtime/components/Tooltip.vue'

const { maps, popups, makeFakeMap } = vi.hoisted(() => {
  interface FakePopupLike { opened: boolean, options: Record<string, unknown> }
  const maps: ReturnType<typeof makeFakeMap>[] = []
  const popups: FakePopupLike[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    // 仅记录带 layerId 的三参数监听，避免把 Map 组件自身的事件转发计入
    const layerHandlers: Record<string, Set<(e?: unknown) => void>> = {}
    const canvas = document.createElement('canvas')
    const self = {
      on(type: string, a: unknown, b?: unknown) {
        const fn = (b ?? a) as (e?: unknown) => void
        ;(handlers[type] ??= new Set()).add(fn)
        if (b !== undefined) (layerHandlers[type] ??= new Set()).add(fn)
      },
      off(type: string, a: unknown, b?: unknown) {
        const fn = (b ?? a) as (e?: unknown) => void
        handlers[type]?.delete(fn)
        layerHandlers[type]?.delete(fn)
      },
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
      },
      count(type: string) {
        return layerHandlers[type]?.size ?? 0
      },
      getCanvas: () => canvas,
      isStyleLoaded: () => true,
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
  return { maps, popups, makeFakeMap }
})

vi.mock('mapbox-gl', () => {
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  class FakePopup {
    opened = false
    private listeners: Record<string, Set<() => void>> = {}
    constructor(public options: Record<string, unknown> = {}) {
      popups.push(this)
    }

    setLngLat() { return this }
    setDOMContent() { return this }
    addTo() {
      this.opened = true
      return this
    }

    remove() {
      if (this.opened) {
        this.opened = false
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
    Marker: function () {},
    Popup: FakePopup
  }
})

const feature = { type: 'Feature', properties: { title: '天安门' }, geometry: { type: 'Point', coordinates: [0, 0] } }
const layerEvent = { features: [feature], lngLat: { lng: 0, lat: 0 } }

async function mountTooltip(props: Record<string, unknown>, slot?: (scope: Record<string, unknown>) => unknown) {
  const Parent = defineComponent({
    setup() {
      return () => h(MapboxMap, { options: {} }, {
        default: () => h(MapboxTooltip, { layerId: 'poi', ...props }, {
          default: slot ?? (({ feature }: Record<string, unknown>) =>
            h('p', (feature as typeof layerEvent.features[0] | undefined)?.properties?.title ?? ''))
        })
      })
    }
  })
  const wrapper = mount(Parent, { attachTo: document.body })
  const map = maps[maps.length - 1]!
  map.fire('load')
  await nextTick()
  await nextTick()
  return { wrapper, map, popup: () => popups[popups.length - 1]! }
}

describe('MapboxTooltip 触发模式', () => {
  beforeEach(() => {
    maps.length = 0
    popups.length = 0
  })

  it('默认 hover：mousemove 展示、mouseleave 收起', async () => {
    const { wrapper, map, popup } = await mountTooltip({})

    map.fire('mousemove', layerEvent)
    await nextTick()
    expect(popup().isOpen()).toBe(true)
    expect(wrapper.text()).toContain('天安门')

    map.fire('mouseleave')
    await nextTick()
    expect(popup().isOpen()).toBe(false)
    wrapper.unmount()
  })

  it('默认 hover：popup 关闭按钮与 closeOnClick 均被接管', async () => {
    const { wrapper, popup } = await mountTooltip({})
    expect(popup().options).toMatchObject({ closeButton: false, closeOnClick: false })
    wrapper.unmount()
  })

  it('trigger=click：click 展示，mouseleave 不再收起', async () => {
    const { wrapper, map, popup } = await mountTooltip({ trigger: 'click' })

    expect(map.count('mousemove')).toBe(0)

    map.fire('click', layerEvent)
    await nextTick()
    expect(popup().isOpen()).toBe(true)

    map.fire('mouseleave')
    await nextTick()
    expect(popup().isOpen()).toBe(true)
    wrapper.unmount()
  })

  it('trigger=click：默认给关闭按钮且不启用 closeOnClick', async () => {
    const { wrapper, popup } = await mountTooltip({ trigger: 'click' })
    expect(popup().options).toMatchObject({ closeButton: true, closeOnClick: false })
    wrapper.unmount()
  })

  it('trigger=none：不绑定任何监听', async () => {
    const { wrapper, map, popup } = await mountTooltip({ trigger: 'none' })

    expect(map.count('mousemove')).toBe(0)
    expect(map.count('click')).toBe(0)
    expect(map.count('mouseenter')).toBe(0)

    map.fire('click', layerEvent)
    await nextTick()
    expect(popup().isOpen()).toBe(false)
    wrapper.unmount()
  })

  it('trigger 可响应式切换，用于临时停用', async () => {
    const trigger = ref<'hover' | 'none'>('hover')
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxTooltip, { layerId: 'poi', trigger: trigger.value }, { default: () => h('p', 'x') })
        })
      }
    })
    const wrapper = mount(Parent, { attachTo: document.body })
    const map = maps[maps.length - 1]!
    map.fire('load')
    await nextTick()
    await nextTick()
    expect(map.count('mousemove')).toBe(1)

    trigger.value = 'none'
    await nextTick()
    expect(map.count('mousemove')).toBe(0)
    wrapper.unmount()
  })

  it('插槽 close 可收起 popup', async () => {
    const { wrapper, map, popup } = await mountTooltip(
      { trigger: 'click' },
      ({ close }) => h('button', { onClick: close as () => void }, 'close')
    )

    map.fire('click', layerEvent)
    await nextTick()
    expect(popup().isOpen()).toBe(true)

    await wrapper.find('button').trigger('click')
    expect(popup().isOpen()).toBe(false)
    wrapper.unmount()
  })
})
