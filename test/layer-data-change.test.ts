import { describe, expect, it, vi } from 'vitest'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { onLayerDataChange } from '../src/runtime/utils/events'

function makeFakeMap() {
  const handlers: Record<string, Set<(e?: unknown) => void>> = {}
  const onceHandlers: Record<string, Set<(e?: unknown) => void>> = {}
  const self = {
    on(type: string, fn: (e?: unknown) => void) { (handlers[type] ??= new Set()).add(fn) },
    once(type: string, fn: (e?: unknown) => void) { (onceHandlers[type] ??= new Set()).add(fn) },
    off(type: string, fn: (e?: unknown) => void) {
      handlers[type]?.delete(fn)
      onceHandlers[type]?.delete(fn)
    },
    fire(type: string, e?: unknown) {
      handlers[type]?.forEach(fn => fn(e))
      const once = [...(onceHandlers[type] ?? [])]
      onceHandlers[type]?.clear()
      once.forEach(fn => fn(e))
    },
    getLayer: (id: string) => (id === 'poi' ? { source: 'poi-src' } : undefined)
  }
  return self
}

const content = (sourceId: string) => ({ sourceId, sourceDataType: 'content' })

describe('onLayerDataChange', () => {
  it('图层 source 数据变化后，在 idle 时回调', () => {
    const map = makeFakeMap()
    const handler = vi.fn()
    onLayerDataChange(map as unknown as MaplibreMap, 'poi', handler)

    map.fire('sourcedata', content('poi-src'))
    expect(handler).not.toHaveBeenCalled()

    map.fire('idle')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('忽略其他 source 与非 content 事件', () => {
    const map = makeFakeMap()
    const handler = vi.fn()
    onLayerDataChange(map as unknown as MaplibreMap, 'poi', handler)

    map.fire('sourcedata', content('other-src'))
    map.fire('sourcedata', { sourceId: 'poi-src', sourceDataType: 'metadata' })
    map.fire('sourcedata', { sourceId: 'poi-src' })
    map.fire('idle')

    expect(handler).not.toHaveBeenCalled()
  })

  it('同一轮多次 content 事件只回调一次', () => {
    const map = makeFakeMap()
    const handler = vi.fn()
    onLayerDataChange(map as unknown as MaplibreMap, 'poi', handler)

    map.fire('sourcedata', content('poi-src'))
    map.fire('sourcedata', content('poi-src'))
    map.fire('idle')
    map.fire('idle')

    expect(handler).toHaveBeenCalledTimes(1)
  })

  it('解绑后不再回调，未触发的 idle 监听一并移除', () => {
    const map = makeFakeMap()
    const handler = vi.fn()
    const stop = onLayerDataChange(map as unknown as MaplibreMap, 'poi', handler)

    map.fire('sourcedata', content('poi-src'))
    stop()
    map.fire('idle')
    map.fire('sourcedata', content('poi-src'))
    map.fire('idle')

    expect(handler).not.toHaveBeenCalled()
  })
})
