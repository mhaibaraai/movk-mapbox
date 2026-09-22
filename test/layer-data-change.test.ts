import { describe, expect, it, vi } from 'vitest'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { onLayerDataChange } from '../src/runtime/utils/events'

function makeFakeMap() {
  const handlers: Record<string, Set<(e?: unknown) => void>> = {}
  // 由用例控制 source 是否存在、是否已加载完成
  const state = { hasSource: true, loaded: true }
  const self = {
    state,
    on(type: string, fn: (e?: unknown) => void) { (handlers[type] ??= new Set()).add(fn) },
    off(type: string, fn: (e?: unknown) => void) { handlers[type]?.delete(fn) },
    fire(type: string, e?: unknown) { [...(handlers[type] ?? [])].forEach(fn => fn(e)) },
    count: (type: string) => handlers[type]?.size ?? 0,
    getLayer: (id: string) => (id === 'poi' ? { source: 'poi-src' } : undefined),
    getSource: (id: string) => (state.hasSource && id === 'poi-src' ? {} : undefined),
    isSourceLoaded: () => state.loaded
  }
  return self
}

const content = (sourceId: string) => ({ sourceId, sourceDataType: 'content' })

function setup() {
  const map = makeFakeMap()
  const handler = vi.fn()
  const stop = onLayerDataChange(map as unknown as MaplibreMap, 'poi', handler)
  return { map, handler, stop }
}

describe('onLayerDataChange', () => {
  it('图层 source 数据变化后，在下一次 render 时回调', () => {
    const { map, handler } = setup()

    map.fire('sourcedata', content('poi-src'))
    expect(handler).not.toHaveBeenCalled()

    map.fire('render')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('持续渲染、从不 idle 时仍会回调', () => {
    const { map, handler } = setup()
    map.state.loaded = false

    map.fire('sourcedata', content('poi-src'))
    map.fire('render')
    map.fire('render')
    expect(handler).not.toHaveBeenCalled()

    map.state.loaded = true
    map.fire('render')
    map.fire('render')
    expect(handler).toHaveBeenCalledTimes(1)
    expect(map.count('render')).toBe(0)
  })

  it('忽略其他 source 与非 content 事件', () => {
    const { map, handler } = setup()

    map.fire('sourcedata', content('other-src'))
    map.fire('sourcedata', { sourceId: 'poi-src', sourceDataType: 'metadata' })
    map.fire('sourcedata', { sourceId: 'poi-src' })
    map.fire('render')

    expect(handler).not.toHaveBeenCalled()
  })

  it('同一轮多次 content 事件只回调一次', () => {
    const { map, handler } = setup()

    map.fire('sourcedata', content('poi-src'))
    map.fire('sourcedata', content('poi-src'))
    map.fire('render')
    map.fire('render')

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('等待期间 source 被移除时放弃回调并解绑 render', () => {
    const { map, handler } = setup()
    map.state.loaded = false

    map.fire('sourcedata', content('poi-src'))
    map.state.hasSource = false
    map.fire('render')

    expect(handler).not.toHaveBeenCalled()
    expect(map.count('render')).toBe(0)
  })

  it('解绑后不再回调，未触发的 render 监听一并移除', () => {
    const { map, handler, stop } = setup()

    map.fire('sourcedata', content('poi-src'))
    stop()
    map.fire('render')
    map.fire('sourcedata', content('poi-src'))
    map.fire('render')

    expect(handler).not.toHaveBeenCalled()
    expect(map.count('render')).toBe(0)
  })
})
