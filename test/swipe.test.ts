import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreSwipe from '../src/runtime/components/extensions/Swipe.vue'
import { useMap } from '../src/runtime/composables/useMap'
import type { FakeCameraMap } from './fixtures/fake-camera-map'

const created = vi.hoisted(() => [] as FakeCameraMap[])

vi.mock('maplibre-gl', async () => {
  const { fakeCameraMap } = await import('./fixtures/fake-camera-map')
  function FakeGlMap(options: Record<string, unknown>) {
    const map = fakeCameraMap({}, options)
    created.push(map)
    return map
  }
  class MapMouseEvent {
    type: string
    target: unknown
    originalEvent: unknown
    constructor(type: string, target: unknown, originalEvent: unknown) {
      this.type = type
      this.target = target
      this.originalEvent = originalEvent
    }
  }
  return { Map: FakeGlMap, MapMouseEvent, LngLat: { convert: (v: unknown) => v } }
})

function mouse(type: string, x: number, y = 50) {
  return { type, point: { x, y }, originalEvent: { type, clientX: x, clientY: y } }
}

async function mountSwipe(props: Record<string, unknown> = {}, children?: () => unknown) {
  created.length = 0
  const show = ref(true)
  const position = ref(0.5)
  const swipeRef = ref<{ isPointRevealed: (p: { x: number, y: number }) => boolean }>()
  const wrapper = mount(defineComponent({
    setup() {
      return () => h(MaplibreMap, { options: {} }, {
        default: () => show.value
          ? h(MaplibreSwipe, {
              'ref': swipeRef,
              'position': position.value,
              'onUpdate:position': (v: number) => { position.value = v },
              ...props
            }, children ? { default: children } : undefined)
          : null
      })
    }
  }), { attachTo: document.body })
  await flushPromises()
  const [main, overlay] = created
  return { wrapper, show, position, swipeRef, main: main!, overlay: overlay! }
}

describe('MaplibreSwipe', () => {
  it('主图就绪后创建不可交互、无版权控件的对照图，并对齐主图相机', async () => {
    created.length = 0
    const { main, overlay, wrapper } = await mountSwipe({ mapStyle: 'https://example.com/style.json' })
    expect(created).toHaveLength(2)
    expect(overlay.options).toMatchObject({
      interactive: false,
      attributionControl: false,
      style: 'https://example.com/style.json',
      zoom: main.camera.zoom
    })
    wrapper.unmount()
  })

  it('省略 mapStyle 时使用空白样式', async () => {
    const { overlay, wrapper } = await mountSwipe()
    expect(overlay.options.style).toMatchObject({ version: 8, sources: {}, layers: [] })
    wrapper.unmount()
  })

  it('相机单向同步：主图移动带动对照图，反之不影响主图', async () => {
    const { main, overlay, wrapper } = await mountSwipe()
    main.userMove({ center: { lng: 1, lat: 2 }, zoom: 8, bearing: 20, pitch: 30 })
    expect(overlay.camera).toEqual({ center: { lng: 1, lat: 2 }, zoom: 8, bearing: 20, pitch: 30 })

    overlay.userMove({ zoom: 3 })
    expect(main.camera.zoom).toBe(8)
    wrapper.unmount()
  })

  it('主图 resize 时对照图随之 resize，投影跟随主图', async () => {
    const { main, overlay, wrapper } = await mountSwipe()
    main.fire('resize')
    expect(overlay.resizeCalls).toBe(1)

    main.projection = { type: 'globe' }
    main.fire('projectiontransition')
    expect(overlay.projection).toEqual({ type: 'globe' })
    wrapper.unmount()
  })

  it('插槽子组件注入的是对照图上下文', async () => {
    let childMap: unknown
    const Child = defineComponent({
      setup() {
        const ctx = useMap()
        ctx.whenAttached().then((map) => {
          childMap = map
        })
        return () => null
      }
    })
    const { overlay, main, wrapper } = await mountSwipe({}, () => h(Child))
    expect(childMap).toBe(overlay)
    expect(childMap).not.toBe(main)
    wrapper.unmount()
  })

  it('v-if 卸载时移除对照图并解绑主图监听，主图保持不变', async () => {
    const { show, main, overlay, wrapper } = await mountSwipe()
    const baseline = { move: main.listenerCount('move'), mousemove: main.listenerCount('mousemove') }
    show.value = false
    await nextTick()
    expect(overlay.removed).toBe(true)
    expect(main.removed).toBe(false)
    expect(main.listenerCount('move')).toBe(baseline.move - 1)
    expect(main.listenerCount('mousemove')).toBe(baseline.mousemove - 1)
    wrapper.unmount()
  })

  it('裁切作用于对照图 canvas，并随 position 与方向变化', async () => {
    const { overlay, position, wrapper } = await mountSwipe()
    expect(overlay.canvas.style).toMatchObject({ clipPath: 'inset(0 0 0 50%)' })
    position.value = 0.2
    await nextTick()
    expect(overlay.canvas.style).toMatchObject({ clipPath: 'inset(0 0 0 20%)' })
    wrapper.unmount()

    const horizontal = await mountSwipe({ orientation: 'horizontal' })
    expect(horizontal.overlay.canvas.style).toMatchObject({ clipPath: 'inset(50% 0 0 0)' })
    horizontal.wrapper.unmount()
  })

  it('方向键与拖拽调整 position', async () => {
    const { wrapper, position } = await mountSwipe()
    const handle = wrapper.find('[role="slider"]')
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    expect(position.value).toBeCloseTo(0.45)
    await handle.trigger('keydown', { key: 'End' })
    expect(position.value).toBe(1)

    const root = wrapper.find('.movk-maplibre-swipe').element as HTMLElement
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 200, height: 100 } as DOMRect)
    await handle.trigger('pointerdown', { clientX: 100, clientY: 0, pointerId: 1 })
    await handle.trigger('pointermove', { clientX: 50, clientY: 0, pointerId: 1 })
    expect(position.value).toBe(0.25)
    await handle.trigger('pointerup', { pointerId: 1 })
    await handle.trigger('pointermove', { clientX: 150, clientY: 0, pointerId: 1 })
    expect(position.value).toBe(0.25)
    wrapper.unmount()
  })

  it('露出区域内的鼠标事件转发给对照图，未露出区域不转发', async () => {
    const { main, overlay, wrapper } = await mountSwipe()
    main.fire('click', mouse('click', 150))
    main.fire('mousemove', mouse('mousemove', 160))
    main.fire('click', mouse('click', 50))
    expect(overlay.fired.map(e => e.type)).toEqual(['click', 'mousemove'])
    expect(overlay.fired[0]!.target).toBe(overlay)
    wrapper.unmount()
  })

  it('指针移出露出区域或离开主图时补发 mouseout', async () => {
    const { main, overlay, wrapper } = await mountSwipe()
    main.fire('mousemove', mouse('mousemove', 150))
    main.fire('mousemove', mouse('mousemove', 40))
    main.fire('mousemove', mouse('mousemove', 30))
    expect(overlay.fired.map(e => e.type)).toEqual(['mousemove', 'mouseout'])

    main.fire('mousemove', mouse('mousemove', 150))
    main.fire('mouseout', mouse('mouseout', 150))
    expect(overlay.fired.map(e => e.type)).toEqual(['mousemove', 'mouseout', 'mousemove', 'mouseout'])
    wrapper.unmount()
  })

  it('对照图设置的光标同步到主图 canvas，移出露出区域时还原', async () => {
    const { main, overlay, wrapper } = await mountSwipe()
    overlay.on('mousemove', () => {
      overlay.canvas.style.cursor = 'pointer'
    })
    main.fire('mousemove', mouse('mousemove', 150))
    expect(main.canvas.style.cursor).toBe('pointer')
    main.fire('mousemove', mouse('mousemove', 20))
    expect(main.canvas.style.cursor).toBe('')
    wrapper.unmount()
  })

  it('暴露 isPointRevealed 供主图侧判断互斥', async () => {
    const { swipeRef, position, wrapper } = await mountSwipe()
    expect(swipeRef.value!.isPointRevealed({ x: 150, y: 10 })).toBe(true)
    position.value = 0.9
    await nextTick()
    expect(swipeRef.value!.isPointRevealed({ x: 150, y: 10 })).toBe(false)
    wrapper.unmount()
  })

  it('版权条汇总对照图来源署名并随 sourcedata 更新', async () => {
    const { overlay, wrapper } = await mountSwipe()
    expect(wrapper.find('.movk-maplibre-swipe__attribution').exists()).toBe(false)
    overlay.sources = { t: { attribution: '© 天地图' } }
    overlay.fire('sourcedata')
    await nextTick()
    expect(wrapper.find('.movk-maplibre-swipe__attribution').text()).toBe('© 天地图')
    wrapper.unmount()
  })
})
