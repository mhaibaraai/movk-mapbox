import { describe, expect, it, vi } from 'vitest'
import type { Map as MapboxMap } from 'mapbox-gl'
import { applyLayerProps } from '../src/runtime/utils/layer'

function createMapStub() {
  return {
    setPaintProperty: vi.fn(),
    setLayoutProperty: vi.fn(),
    setFilter: vi.fn(),
    setLayerZoomRange: vi.fn()
  }
}

describe('applyLayerProps', () => {
  it('仅对变化的 paint 属性调用 setter', () => {
    const map = createMapStub()
    applyLayerProps(
      map as unknown as MapboxMap,
      { id: 'l', paint: { 'circle-color': '#f00', 'circle-radius': 8 } },
      { id: 'l', paint: { 'circle-color': '#f00', 'circle-radius': 4 } }
    )
    expect(map.setPaintProperty).toHaveBeenCalledTimes(1)
    expect(map.setPaintProperty).toHaveBeenCalledWith('l', 'circle-radius', 8)
  })

  it('paint 无变化时不调用 setter', () => {
    const map = createMapStub()
    const paint = { 'circle-color': '#f00' }
    applyLayerProps(map as unknown as MapboxMap, { id: 'l', paint }, { id: 'l', paint: { 'circle-color': '#f00' } })
    expect(map.setPaintProperty).not.toHaveBeenCalled()
  })

  it('filter 变化时调用 setFilter，缩放范围变化时调用 setLayerZoomRange', () => {
    const map = createMapStub()
    applyLayerProps(
      map as unknown as MapboxMap,
      { id: 'l', filter: ['==', 'a', 1], minzoom: 2 },
      { id: 'l', filter: ['==', 'a', 2], minzoom: 1 }
    )
    expect(map.setFilter).toHaveBeenCalledWith('l', ['==', 'a', 1])
    expect(map.setLayerZoomRange).toHaveBeenCalledWith('l', 2, 24)
  })
})
