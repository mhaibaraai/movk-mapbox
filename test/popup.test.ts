import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxPopup from '../src/runtime/components/Popup.vue'

const { maps, popups, makeFakeMap } = vi.hoisted(() => {
  interface FakePopupLike {
    opened: boolean
    content?: HTMLElement
    lnglats: unknown[]
    removed: number
  }
  const maps: ReturnType<typeof makeFakeMap>[] = []
  const popups: FakePopupLike[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const self = {
      on(type: string, a: unknown, b?: unknown) {
        ;(handlers[type] ??= new Set()).add((b ?? a) as (e?: unknown) => void)
      },
      off() {},
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
      },
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
    content?: HTMLElement
    lnglats: unknown[] = []
    removed = 0
    constructor(public options: Record<string, unknown> = {}) {
      popups.push(this)
    }

    setLngLat(v: unknown) {
      this.lnglats.push(v)
      return this
    }

    // 记录被交给 mapbox 的节点：真实实现会把它搬进 .mapboxgl-popup-content
    setDOMContent(node: HTMLElement) {
      this.content = node
      return this
    }

    addTo() {
      this.opened = true
      return this
    }

    remove() {
      this.removed++
      this.opened = false
      return this
    }

    on() {}
    isOpen() { return this.opened }
  }
  return {
    default: { Map: FakeGlMap, accessToken: '', prewarm() {}, setRTLTextPlugin() {} },
    LngLat: { convert: (v: unknown) => v },
    Marker: function () {},
    Popup: FakePopup
  }
})

/** 挂载 MapboxMap + MapboxPopup；load 由调用方决定何时触发 */
function mountPopup(props: Record<string, unknown> = {}) {
  const Parent = defineComponent({
    setup() {
      return () => h(MapboxMap, { options: {} }, {
        default: () => h(MapboxPopup, { lnglat: [0, 0], ...props }, {
          default: () => h('span', { 'data-test': 'card' }, 'content')
        })
      })
    }
  })
  const wrapper = mount(Parent, { attachTo: document.body })
  const map = () => maps[maps.length - 1]!
  return { wrapper, map }
}

const cardEl = (wrapper: ReturnType<typeof mountPopup>['wrapper']) =>
  wrapper.get('[data-test="card"]').element as HTMLElement

describe('MapboxPopup 挂载前的内容隔离', () => {
  beforeEach(() => {
    maps.length = 0
    popups.length = 0
  })

  // 回归：地图就绪前 popup 内容不得参与文档流，否则会裸露在地图容器左上角
  it('地图未 load 时，内容被 display:none 的宿主隔离', async () => {
    const { wrapper } = mountPopup()
    await nextTick()

    // 尚未创建 mapbox Popup（还在 await whenLoaded）
    expect(popups).toHaveLength(0)

    const el = cardEl(wrapper).parentElement!
    const host = el.parentElement!
    expect(host.style.display).toBe('none')
    wrapper.unmount()
  })

  it('地图 load 后把内层节点交给 mapbox，内容脱离隐藏宿主', async () => {
    const { wrapper, map } = mountPopup()
    await nextTick()
    const el = cardEl(wrapper).parentElement!

    map().fire('load')
    await nextTick()
    await nextTick()

    expect(popups).toHaveLength(1)
    expect(popups[0]!.content).toBe(el)
    expect(popups[0]!.opened).toBe(true)
    wrapper.unmount()
  })

  it('透传 attrs 落在内层节点而非隐藏宿主', async () => {
    const { wrapper } = mountPopup({ class: 'my-popup' })
    await nextTick()

    const el = cardEl(wrapper).parentElement!
    const host = el.parentElement!
    expect(el.classList.contains('my-popup')).toBe(true)
    expect(host.classList.contains('my-popup')).toBe(false)
    wrapper.unmount()
  })

  it('lnglat 变更更新位置，卸载移除 popup', async () => {
    const lnglat = ref<[number, number]>([1, 2])
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxPopup, { lnglat: lnglat.value }, { default: () => h('span', 'x') })
        })
      }
    })
    const wrapper = mount(Parent, { attachTo: document.body })
    maps[maps.length - 1]!.fire('load')
    await nextTick()
    await nextTick()

    lnglat.value = [3, 4]
    await nextTick()
    expect(popups[0]!.lnglats).toContainEqual([3, 4])

    wrapper.unmount()
    expect(popups[0]!.removed).toBeGreaterThan(0)
  })
})
