import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreCompare from '../src/runtime/components/extensions/Compare.vue'
import type { FakeCameraMap } from './fixtures/fake-camera-map'

const created = vi.hoisted(() => [] as FakeCameraMap[])

vi.mock('maplibre-gl', async () => {
  const { fakeCameraMap } = await import('./fixtures/fake-camera-map')
  function FakeGlMap() {
    const map = fakeCameraMap()
    created.push(map)
    return map
  }
  return { Map: FakeGlMap, LngLat: { convert: (v: unknown) => v } }
})

function mountCompare(props: Record<string, unknown> = {}) {
  created.length = 0
  const position = ref(0.5)
  const wrapper = mount(defineComponent({
    setup() {
      return () => h(MaplibreCompare, {
        'position': position.value,
        'onUpdate:position': (v: number) => { position.value = v },
        ...props
      }, {
        before: () => h(MaplibreMap, { options: {} }),
        after: () => h(MaplibreMap, { options: {} })
      })
    }
  }), { attachTo: document.body })
  return { wrapper, position }
}

function afterPane(wrapper: ReturnType<typeof mount>) {
  return wrapper.find('.movk-maplibre-compare__after').element as HTMLElement
}

describe('MaplibreCompare', () => {
  it('按 position 裁切后图，并渲染两张地图', async () => {
    const { wrapper } = mountCompare()
    await nextTick()
    expect(wrapper.findAll('.movk-maplibre')).toHaveLength(2)
    expect(afterPane(wrapper).style.clipPath).toBe('inset(0 0 0 50%)')
    wrapper.unmount()
  })

  it('horizontal 方向按纵向裁切', async () => {
    const { wrapper } = mountCompare({ orientation: 'horizontal' })
    await nextTick()
    expect(afterPane(wrapper).style.clipPath).toBe('inset(50% 0 0 0)')
    wrapper.unmount()
  })

  it('两张地图相机联动', async () => {
    const { wrapper } = mountCompare()
    await nextTick()
    const [before, after] = created
    before!.userMove({ zoom: 7 })
    expect(after!.camera.zoom).toBe(7)
    after!.userMove({ bearing: 45 })
    expect(before!.camera.bearing).toBe(45)
    wrapper.unmount()
  })

  it('sync 为 false 时不联动', async () => {
    const { wrapper } = mountCompare({ sync: false })
    await nextTick()
    const [before, after] = created
    before!.userMove({ zoom: 7 })
    expect(after!.camera.zoom).toBe(1)
    wrapper.unmount()
  })

  it('方向键按步长调整 position', async () => {
    const { wrapper, position } = mountCompare()
    await nextTick()
    const handle = wrapper.find('[role="slider"]')
    expect(handle.attributes('aria-valuenow')).toBe('50')
    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(position.value).toBeCloseTo(0.55)
    await handle.trigger('keydown', { key: 'Home' })
    expect(position.value).toBe(0)
    await handle.trigger('keydown', { key: 'End' })
    expect(position.value).toBe(1)
    wrapper.unmount()
  })

  it('拖拽分隔条按指针位置更新 position', async () => {
    const { wrapper, position } = mountCompare()
    await nextTick()
    const root = wrapper.find('.movk-maplibre-compare').element as HTMLElement
    vi.spyOn(root, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, width: 200, height: 100 } as DOMRect)
    const handle = wrapper.find('[role="slider"]')

    await handle.trigger('pointerdown', { clientX: 100, clientY: 0, pointerId: 1 })
    await handle.trigger('pointermove', { clientX: 50, clientY: 0, pointerId: 1 })
    expect(position.value).toBe(0.25)
    await handle.trigger('pointerup', { pointerId: 1 })
    await handle.trigger('pointermove', { clientX: 150, clientY: 0, pointerId: 1 })
    expect(position.value).toBe(0.25)
    wrapper.unmount()
  })
})
