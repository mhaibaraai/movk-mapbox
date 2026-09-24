import { describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import MaplibreLayerGroup from '../src/runtime/components/LayerGroup.vue'
import MaplibreLayerControl from '../src/runtime/components/controls/LayerControl.vue'
import type { FakeStyleMap } from './fixtures/fake-style-map'
import { mountInMap } from './fixtures/mount-map'

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

describe('MaplibreLayerControl', () => {
  it('默认收起，展开后按声明顺序列出带 title 的图层组', async () => {
    const { control, wrapper } = await mountInMap(created, () => [
      h(MaplibreLayerGroup, { title: '学校' }),
      h(MaplibreLayerGroup, { title: '医院' }),
      h(MaplibreLayerControl)
    ])
    const trigger = control<HTMLButtonElement>('.movk-maplibre-control__trigger')!
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(trigger.querySelector('svg')).not.toBeNull()
    trigger.click()
    await nextTick()
    const titles = [...control('.movk-maplibre-control__panel')!.querySelectorAll('.movk-maplibre-layer-control__title')].map(el => el.textContent)
    expect(titles).toEqual(['学校', '医院'])
    wrapper.unmount()
  })

  it('勾选与滑块写回图层组的 v-model', async () => {
    const visible = ref(true)
    const opacity = ref(1)
    const { control, wrapper } = await mountInMap(created, () => [
      h(MaplibreLayerGroup, {
        'title': '学校',
        'visible': visible.value,
        'onUpdate:visible': (v: boolean) => { visible.value = v },
        'opacity': opacity.value,
        'onUpdate:opacity': (v: number) => { opacity.value = v }
      }),
      h(MaplibreLayerControl, { open: true })
    ])
    const checkbox = control<HTMLInputElement>('input[type="checkbox"]')!
    expect(checkbox.checked).toBe(true)
    checkbox.checked = false
    checkbox.dispatchEvent(new Event('change'))
    await nextTick()
    expect(visible.value).toBe(false)

    const range = control<HTMLInputElement>('input[type="range"]')!
    expect(range.getAttribute('aria-label')).toContain('学校')
    range.value = '0.3'
    range.dispatchEvent(new Event('input'))
    await nextTick()
    expect(opacity.value).toBe(0.3)
    wrapper.unmount()
  })

  it('opacity 为 false 时不渲染滑块，item 插槽可自定义行', async () => {
    const { control, wrapper } = await mountInMap(created, () => [
      h(MaplibreLayerGroup, { title: '学校' }),
      h(MaplibreLayerControl, { open: true, opacity: false }, {
        item: ({ item }: { item: { title: string } }) => h('b', { class: 'custom-row' }, item.title)
      })
    ])
    expect(control('input[type="range"]')).toBeNull()
    expect(control('.custom-row')?.textContent).toBe('学校')
    wrapper.unmount()
  })
})
