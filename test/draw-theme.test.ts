import { describe, expect, it } from 'vitest'
import type { GeoJSONStoreFeatures } from 'terra-draw'
import { drawThemeStyles } from '../src/runtime/utils/draw-theme'

type StyleFn = (feature: GeoJSONStoreFeatures) => unknown

function feature(properties: Record<string, unknown> = {}): GeoJSONStoreFeatures {
  return {
    type: 'Feature',
    id: 'f',
    properties: { mode: 'polygon', ...properties },
    geometry: { type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] }
  } as GeoJSONStoreFeatures
}

describe('drawThemeStyles', () => {
  it('覆盖选择模式与全部内置绘制模式', () => {
    const styles = drawThemeStyles()
    expect(Object.keys(styles).sort()).toEqual(
      ['circle', 'ellipse', 'linestring', 'point', 'polygon', 'rectangle', 'sector', 'select'].sort()
    )
  })

  it('颜色由要素 color 属性覆盖，缺省回退主题色', () => {
    const { polygon, linestring, point } = drawThemeStyles({ color: '#123456' })
    const fill = polygon.fillColor as StyleFn

    expect(fill(feature())).toBe('#123456')
    expect(fill(feature({ color: '#ff0000' }))).toBe('#ff0000')
    expect((linestring.lineStringColor as StyleFn)(feature({ color: '#00ff00' }))).toBe('#00ff00')
    expect((point.pointColor as StyleFn)(feature())).toBe('#123456')
  })

  it('激活色用于选中态与绘制过程中的辅助点', () => {
    const { select, polygon } = drawThemeStyles({ activeColor: '#abcdef' })
    expect(select.selectedPolygonColor).toBe('#abcdef')
    expect(select.selectionPointColor).toBe('#abcdef')
    expect(polygon.closingPointColor).toBe('#abcdef')
  })

  it('数值参数注入填充透明度、线宽与顶点半径', () => {
    const { polygon, linestring, select } = drawThemeStyles({ fillOpacity: 0.3, lineWidth: 4, vertexRadius: 7 })
    expect(polygon.fillOpacity).toBe(0.3)
    expect(polygon.outlineWidth).toBe(4)
    expect(linestring.lineStringWidth).toBe(4)
    expect(select.selectionPointWidth).toBe(7)
  })
})
