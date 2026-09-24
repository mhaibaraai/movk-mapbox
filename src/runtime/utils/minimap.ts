import type { Feature, Polygon } from 'geojson'
import type { Map as MaplibreMap } from 'maplibre-gl'

/** 鹰眼缩放级别：主图缩放叠加偏移，不低于 0 */
export function minimapZoom(parentZoom: number, offset: number): number {
  return Math.max(parentZoom + offset, 0)
}

/** 主图视口多边形：容器四角反投影，旋转、倾斜时同样贴合可视范围 */
export function viewportPolygon(map: Pick<MaplibreMap, 'getContainer' | 'unproject'>): Feature<Polygon> {
  const { clientWidth: w, clientHeight: h } = map.getContainer()
  const ring = ([[0, 0], [w, 0], [w, h], [0, h]] as const).map(([x, y]) => {
    const { lng, lat } = map.unproject([x, y])
    return [lng, lat]
  })
  return {
    type: 'Feature',
    properties: {},
    geometry: { type: 'Polygon', coordinates: [[...ring, ring[0]!]] }
  }
}
