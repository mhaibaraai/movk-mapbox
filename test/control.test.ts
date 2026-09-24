import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import MaplibreMap from '../src/runtime/components/Map.vue'
import MaplibreControl from '../src/runtime/components/controls/Control.vue'
import type { FakeStyleMap } from './fixtures/fake-style-map'

const created = vi.hoisted(() => [] as FakeStyleMap[])

vi.mock('maplibre-gl', async () => {
  const { fakeStyleMap } = await import('./fixtures/fake-style-map')
  function FakeGlMap() {
    const map = fakeStyleMap()
    created.push(map)
    return map
  }
  return { Map: FakeGlMap, LngLat: { convert: (v: unknown) => v } }
})

async function mountControl(props: () => Record<string, unknown>, slots: Record<string, () => unknown>) {
  const wrapper = mount(defineComponent({
    setup() {
      return () => h(MaplibreMap, { options: {} }, { default: () => h(MaplibreControl, props(), slots) })
    }
  }), { attachTo: document.body })
  await flushPromises()
  const map = created.at(-1)!
  const control = () => map.controlContainer.querySelector<HTMLElement>('.movk-maplibre-control')!
  return { wrapper, map, control }
}

describe('MaplibreControl', () => {
  it('插槽内容渲染进 maplibre 控件元素，默认带控件组样式', async () => {
    const { control, wrapper } = await mountControl(() => ({ position: 'top-left' }), {
      default: () => h('span', { class: 'custom' }, 'hello')
    })
    expect(control().querySelector('.custom')?.textContent).toBe('hello')
    expect(control().dataset.position).toBe('top-left')
    expect(control().classList).toContain('maplibregl-ctrl-group')
    wrapper.unmount()
  })

  it('group 为 false 时不加控件组样式', async () => {
    const { control, wrapper } = await mountControl(() => ({ group: false }), { default: () => 'x' })
    expect(control().classList).not.toContain('maplibregl-ctrl-group')
    wrapper.unmount()
  })

  it('position 变化时迁移到新控件元素并移除旧元素', async () => {
    const position = ref('top-left')
    const { control, map, wrapper } = await mountControl(() => ({ position: position.value }), {
      default: () => h('span', { class: 'custom' }, 'hello')
    })
    position.value = 'bottom-right'
    await flushPromises()
    expect(map.controlContainer.querySelectorAll('.movk-maplibre-control')).toHaveLength(1)
    expect(control().dataset.position).toBe('bottom-right')
    expect(control().querySelector('.custom')).not.toBeNull()
    wrapper.unmount()
  })

  it('可折叠：默认收起，点击按钮展开，Esc 与点击外部收起', async () => {
    const onOpen = vi.fn()
    const { control, wrapper } = await mountControl(() => ({ 'collapsible': true, 'label': '图层', 'onUpdate:open': onOpen }), {
      default: () => h('span', { class: 'panel-content' }, 'panel'),
      trigger: () => h('i', { class: 'icon' })
    })
    const trigger = () => control().querySelector<HTMLButtonElement>('.movk-maplibre-control__trigger')!
    const panel = () => control().querySelector<HTMLElement>('.movk-maplibre-control__panel')!
    expect(trigger().getAttribute('aria-expanded')).toBe('false')
    expect(trigger().getAttribute('aria-label')).toBe('图层')
    expect(trigger().querySelector('.icon')).not.toBeNull()
    expect(panel().style.display).toBe('none')

    trigger().click()
    await nextTick()
    expect(onOpen).toHaveBeenLastCalledWith(true)
    expect(panel().style.display).toBe('')
    expect(trigger().getAttribute('aria-controls')).toBe(panel().id)

    panel().dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(onOpen).toHaveBeenLastCalledWith(false)

    trigger().click()
    await nextTick()
    // 真实点击序列：onClickOutside 在 pointerdown 判定、click 触发；同一宏任务内的多次 click 只处理首个
    await new Promise(resolve => setTimeout(resolve, 0))
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(onOpen).toHaveBeenLastCalledWith(false)
    wrapper.unmount()
  })

  it('面板内关闭按钮收起；dismissible 为 false 时点击外部不收起', async () => {
    const onOpen = vi.fn()
    const { control, wrapper } = await mountControl(() => ({ 'collapsible': true, 'dismissible': false, 'open': true, 'onUpdate:open': onOpen }), {
      default: () => 'panel'
    })
    document.body.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    await nextTick()
    expect(onOpen).not.toHaveBeenCalled()

    control().querySelector<HTMLButtonElement>('.movk-maplibre-control__close')!.click()
    await nextTick()
    expect(onOpen).toHaveBeenLastCalledWith(false)
    wrapper.unmount()
  })

  it('open 受控时按外部值展开', async () => {
    const { control, wrapper } = await mountControl(() => ({ collapsible: true, open: true }), {
      default: () => 'panel'
    })
    expect(control().querySelector<HTMLElement>('.movk-maplibre-control__panel')!.style.display).toBe('')
    wrapper.unmount()
  })

  it('卸载时移除控件元素', async () => {
    const { map, wrapper } = await mountControl(() => ({}), { default: () => 'x' })
    wrapper.unmount()
    expect(map.controlContainer.querySelector('.movk-maplibre-control')).toBeNull()
  })
})
