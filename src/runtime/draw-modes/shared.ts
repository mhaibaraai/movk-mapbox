import type { DrawCustomModeThis, DrawPolygon } from '@mapbox/mapbox-gl-draw'
import type { Position } from 'geojson'

/** 在地图上新建一个空多边形要素并纳入绘制管理。 */
export function createPolygonFeature(
  ctx: DrawCustomModeThis,
  properties: Record<string, unknown> = {}
): DrawPolygon {
  const feature = ctx.newFeature({
    type: 'Feature',
    properties,
    geometry: { type: 'Polygon', coordinates: [[]] }
  }) as unknown as DrawPolygon
  ctx.addFeature(feature)
  ctx.clearSelectedFeatures()
  ctx.updateUIClasses({ mouse: 'add' })
  ctx.setActionableState({ trash: true, combineFeatures: false, uncombineFeatures: false })
  return feature
}

/** 固化要素并派发 draw.create,随后切回选择模式。 */
export function completeFeature(ctx: DrawCustomModeThis, feature: DrawPolygon): void {
  ctx.map.fire('draw.create', { features: [feature.toGeoJSON()] })
  ctx.changeMode('simple_select', { featureIds: [String(feature.id)] })
}

/** Esc 取消:删除悬挂要素并回到选择模式。 */
export function cancelFeature(ctx: DrawCustomModeThis, feature: DrawPolygon): void {
  ctx.deleteFeature(String(feature.id), { silent: true })
  ctx.changeMode('simple_select')
}

/** onStop 兜底:多边形外环未闭合(点数 < 5)视为未成形,清理之。 */
export function discardIfIncomplete(ctx: DrawCustomModeThis, feature: DrawPolygon): void {
  const ring = (feature.coordinates as Position[][])[0]
  if (!ring || ring.length < 5) ctx.deleteFeature(String(feature.id), { silent: true })
}
