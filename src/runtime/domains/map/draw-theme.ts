import type { GeoJSONStoreFeatures, HexColor } from 'terra-draw'
import type { DrawModeName, DrawThemeOptions } from '../../types'

type ColorStyle = (feature: GeoJSONStoreFeatures) => HexColor
type ModeStyles = Record<string, number | HexColor | ColorStyle>

/** 各内置模式的 terra-draw styles，键为模式名 */
export type DrawThemeStyles = Record<DrawModeName, ModeStyles>

/**
 * 生成 terra-draw 各内置模式的主题样式。
 * 要素 `properties.color` 优先于主题色，便于按要素单独着色（配合 setFeatureProperty）。
 */
export function drawThemeStyles(options: DrawThemeOptions = {}): DrawThemeStyles {
  const color = options.color ?? '#3b82f6'
  const activeColor = options.activeColor ?? '#f59e0b'
  const fillOpacity = options.fillOpacity ?? 0.1
  const lineWidth = options.lineWidth ?? 2
  const vertexRadius = options.vertexRadius ?? 5

  const themed: ColorStyle = feature => (feature.properties?.color as HexColor | undefined) ?? color
  const shape: ModeStyles = { fillColor: themed, fillOpacity, outlineColor: themed, outlineWidth: lineWidth }
  const guidance = (prefix: string): Record<string, number | HexColor> => ({
    [`${prefix}Color`]: activeColor,
    [`${prefix}Width`]: vertexRadius,
    [`${prefix}OutlineColor`]: '#ffffff',
    [`${prefix}OutlineWidth`]: 2
  })

  return {
    select: {
      selectedPointColor: activeColor,
      selectedPointWidth: vertexRadius + 1,
      selectedLineStringColor: activeColor,
      selectedLineStringWidth: lineWidth,
      selectedPolygonColor: activeColor,
      selectedPolygonFillOpacity: fillOpacity,
      selectedPolygonOutlineColor: activeColor,
      selectedPolygonOutlineWidth: lineWidth,
      ...guidance('selectionPoint'),
      midPointColor: activeColor,
      midPointWidth: Math.max(vertexRadius - 2, 1),
      midPointOutlineColor: '#ffffff',
      midPointOutlineWidth: 1
    },
    point: { pointColor: themed, pointWidth: vertexRadius, pointOutlineColor: '#ffffff', pointOutlineWidth: 2 },
    linestring: { lineStringColor: themed, lineStringWidth: lineWidth, ...guidance('closingPoint'), ...guidance('coordinatePoint') },
    polygon: { ...shape, ...guidance('closingPoint'), ...guidance('coordinatePoint') },
    rectangle: shape,
    circle: shape,
    ellipse: shape,
    sector: shape
  }
}
