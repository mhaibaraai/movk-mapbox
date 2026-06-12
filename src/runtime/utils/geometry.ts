import type { GeoJSON, Geometry, Position } from 'geojson'

/** 西南/东北角包围盒，可直接传给 map.fitBounds */
export type LngLatBoundsTuple = [[number, number], [number, number]]

/** 扫描任意 GeoJSON 的全部坐标求包围盒；无坐标时返回 undefined。 */
export function boundsOfGeoJSON(input: GeoJSON): LngLatBoundsTuple | undefined {
  let west = Infinity
  let south = Infinity
  let east = -Infinity
  let north = -Infinity
  let found = false

  function visitPosition(position: Position): void {
    const [lng, lat] = position
    if (typeof lng !== 'number' || typeof lat !== 'number') return
    found = true
    if (lng < west) west = lng
    if (lng > east) east = lng
    if (lat < south) south = lat
    if (lat > north) north = lat
  }

  // coordinates 嵌套深度随几何类型变化，按首元素是否为数字判定叶子
  function visitCoordinates(coordinates: unknown[]): void {
    if (coordinates.length === 0) return
    if (typeof coordinates[0] === 'number') {
      visitPosition(coordinates as Position)
      return
    }
    for (const child of coordinates) visitCoordinates(child as unknown[])
  }

  function visitGeometry(geometry: Geometry): void {
    if (geometry.type === 'GeometryCollection') {
      for (const child of geometry.geometries) visitGeometry(child)
      return
    }
    visitCoordinates(geometry.coordinates)
  }

  if (input.type === 'FeatureCollection') {
    for (const feature of input.features) {
      if (feature.geometry) visitGeometry(feature.geometry)
    }
  } else if (input.type === 'Feature') {
    if (input.geometry) visitGeometry(input.geometry)
  } else {
    visitGeometry(input)
  }

  return found ? [[west, south], [east, north]] : undefined
}
