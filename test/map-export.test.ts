import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import MapboxMap from '../src/runtime/components/Map.vue'
import { useMapExport } from '../src/runtime/composables/useMapExport'

const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const self = {
      triggerRepaintCalls: 0,
      on(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        ;(handlers[type] ??= new Set()).add(listener)
      },
      once(type: string, cb: () => void) {
        // render 在 triggerRepaint 后异步触发
        ;(handlers[`once:${type}`] ??= new Set()).add(cb)
      },
      off(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        handlers[type]?.delete(listener)
      },
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
        handlers[`once:${type}`]?.forEach(fn => fn(e))
        handlers[`once:${type}`]?.clear()
      },
      isStyleLoaded: () => true,
      triggerRepaint() {
        self.triggerRepaintCalls++
        // 模拟下一帧渲染
        queueMicrotask(() => self.fire('render'))
      },
      getCanvas: () => ({ toDataURL: (fmt: string) => `data:${fmt};base64,FAKE` }),
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

async function mountExport() {
  let api!: ReturnType<typeof useMapExport>
  const Child = defineComponent({
    setup() {
      api = useMapExport()
      return () => h('div')
    }
  })
  mount(MapboxMap, { props: { options: {} }, slots: { default: () => h(Child) } })
  const map = maps[maps.length - 1]!
  map.fire('load')
  await Promise.resolve()
  await Promise.resolve()
  return { map, api }
}

describe('useMapExport', () => {
  it('triggerRepaint 后于 render 回调内读 canvas 返回 dataURL', async () => {
    const { map, api } = await mountExport()
    const url = await api.exportImage({ format: 'image/jpeg' })
    expect(map.triggerRepaintCalls).toBe(1)
    expect(url).toBe('data:image/jpeg;base64,FAKE')
  })

  it('download 经临时链接触发,沿用导出结果', async () => {
    const { api } = await mountExport()
    const click = vi.fn()
    const anchor = { href: '', download: '', click } as unknown as HTMLAnchorElement
    const spy = vi.spyOn(document, 'createElement').mockReturnValue(anchor)

    await api.download({ fileName: 'shot.png' })
    expect(anchor.download).toBe('shot.png')
    expect(anchor.href).toBe('data:image/png;base64,FAKE')
    expect(click).toHaveBeenCalled()
    spy.mockRestore()
  })
})
