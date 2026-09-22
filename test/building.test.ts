import { describe, expect, it } from 'vitest'
import { buildingExtrusionPaint, buildingLayerSpec } from '../src/runtime/utils/building'

describe('buildingLayerSpec', () => {
  it('source 由调用方指定，不附带任何厂商专有过滤条件', () => {
    const spec = buildingLayerSpec({ id: 'demo-buildings', source: 'openmaptiles', sourceLayer: 'building' })
    expect(spec.id).toBe('demo-buildings')
    expect(spec.type).toBe('fill-extrusion')
    expect(spec.source).toBe('openmaptiles')
    expect(spec['source-layer']).toBe('building')
    expect(spec.filter).toBeUndefined()
    expect(spec.minzoom).toBe(15)
  })

  it('GeoJSON 源省略 sourceLayer 时不输出 source-layer 字段', () => {
    const spec = buildingLayerSpec({ id: 'b', source: 'geojson-buildings' })
    expect('source-layer' in spec).toBe(false)
  })

  it('高度与底面默认读取 OpenMapTiles 的 render_height / render_min_height', () => {
    const spec = buildingLayerSpec({ id: 'b', source: 's' })
    const paint = spec.paint as Record<string, unknown>
    expect(JSON.stringify(paint['fill-extrusion-height'])).toContain('"get","render_height"')
    expect(JSON.stringify(paint['fill-extrusion-base'])).toContain('"get","render_min_height"')
  })

  it('支持自定义高度字段', () => {
    const spec = buildingLayerSpec({ id: 'b', source: 's', heightProperty: 'height', baseProperty: 'min_height' })
    const paint = spec.paint as Record<string, unknown>
    expect(JSON.stringify(paint['fill-extrusion-height'])).toContain('"get","height"')
    expect(JSON.stringify(paint['fill-extrusion-base'])).toContain('"get","min_height"')
  })

  it('支持覆盖颜色/透明度/缩放下限与整体 paint', () => {
    const spec = buildingLayerSpec({ id: 'b', source: 's', color: '#ff0000', opacity: 0.5, minzoom: 13 })
    const paint = spec.paint as Record<string, unknown>
    expect(paint['fill-extrusion-color']).toBe('#ff0000')
    expect(paint['fill-extrusion-opacity']).toBe(0.5)
    expect(spec.minzoom).toBe(13)

    const custom = buildingLayerSpec({ id: 'b', source: 's', paint: { 'fill-extrusion-color': '#0f0' } })
    expect((custom.paint as Record<string, unknown>)['fill-extrusion-color']).toBe('#0f0')
    expect((custom.paint as Record<string, unknown>)['fill-extrusion-height']).toBeUndefined()
  })
})

describe('buildingExtrusionPaint', () => {
  it('进入 minzoom 后 0.05 级内由 0 插值到要素高度', () => {
    const paint = buildingExtrusionPaint({ minzoom: 14, heightProperty: 'h', baseProperty: 'b' })
    expect(paint['fill-extrusion-height']).toEqual(['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'h']])
    expect(paint['fill-extrusion-base']).toEqual(['interpolate', ['linear'], ['zoom'], 14, 0, 14.05, ['get', 'b']])
  })
})
