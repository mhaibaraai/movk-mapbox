import { describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref, toRaw } from 'vue'
import MaplibreBasemapControl from '../src/runtime/components/controls/BasemapControl.vue'
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

const imagery = { version: 8 as const, sources: {}, layers: [] }
const items = [
  { label: '矢量', style: 'https://example.com/vector.json' },
  { label: '影像', style: imagery }
]

describe('MaplibreBasemapControl', () => {
  it('按引用或字符串相等标记选中项，选择后发出对应 style', async () => {
    const style = ref<unknown>('https://example.com/vector.json')
    const { control, map, wrapper } = await mountInMap(created, () => h(MaplibreBasemapControl, {
      'items': items,
      'open': true,
      'modelValue': style.value,
      'onUpdate:modelValue': (v: unknown) => { style.value = v }
    }))
    const options = () => [...control('.movk-maplibre-control__panel')!.querySelectorAll<HTMLButtonElement>('[role="radio"]')]
    expect(options().map(el => el.getAttribute('aria-checked'))).toEqual(['true', 'false'])

    options()[1]!.click()
    await nextTick()
    // ref 保存的对象为响应式代理，按原始对象比较仍能标记选中
    expect(toRaw(style.value)).toBe(imagery)
    expect(options().map(el => el.getAttribute('aria-checked'))).toEqual(['false', 'true'])
    // 受控组件：不直接改地图样式
    expect(map.layoutCalls).toHaveLength(0)
    wrapper.unmount()
  })

  it('有缩略图时渲染为网格并显示图片', async () => {
    const { control, wrapper } = await mountInMap(created, () => h(MaplibreBasemapControl, {
      items: [{ label: '影像', style: imagery, thumbnail: 'https://example.com/img.png' }],
      open: true
    }))
    expect(control('.movk-maplibre-basemap-control--grid')).not.toBeNull()
    expect(control<HTMLImageElement>('img')!.getAttribute('src')).toBe('https://example.com/img.png')
    wrapper.unmount()
  })
})
