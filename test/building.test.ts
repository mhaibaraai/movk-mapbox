import { describe, expect, it } from 'vitest'
import { buildingLayerSpec } from '../src/runtime/utils/building'

describe('buildingLayerSpec', () => {
  it('默认指向 Mapbox 官方样式的 composite/building', () => {
    const spec = buildingLayerSpec({ id: 'demo-buildings' })
    expect(spec.id).toBe('demo-buildings')
    expect(spec.type).toBe('fill-extrusion')
    expect(spec.source).toBe('composite')
    expect(spec['source-layer']).toBe('building')
    expect(spec.filter).toEqual(['==', 'extrude', 'true'])
    expect(spec.minzoom).toBe(15)
  })

  it('高度与底面按 zoom 插值读取要素属性', () => {
    const spec = buildingLayerSpec({ id: 'b' })
    const paint = spec.paint as Record<string, unknown>
    expect(JSON.stringify(paint['fill-extrusion-height'])).toContain('"get","height"')
    expect(JSON.stringify(paint['fill-extrusion-base'])).toContain('"get","min_height"')
  })

  it('支持覆盖颜色/透明度/缩放下限与整体 paint', () => {
    const spec = buildingLayerSpec({ id: 'b', color: '#ff0000', opacity: 0.5, minzoom: 13 })
    const paint = spec.paint as Record<string, unknown>
    expect(paint['fill-extrusion-color']).toBe('#ff0000')
    expect(paint['fill-extrusion-opacity']).toBe(0.5)
    expect(spec.minzoom).toBe(13)

    const custom = buildingLayerSpec({ id: 'b', paint: { 'fill-extrusion-color': '#0f0' } })
    expect((custom.paint as Record<string, unknown>)['fill-extrusion-color']).toBe('#0f0')
    expect((custom.paint as Record<string, unknown>)['fill-extrusion-height']).toBeUndefined()
  })
})
