import gcoord from 'gcoord'

/** 常用坐标系标识，对齐 gcoord 的 CRS 常量 */
export type CRS = 'WGS84' | 'GCJ02' | 'BD09' | 'EPSG3857'

const CRS_MAP = {
  WGS84: gcoord.WGS84,
  GCJ02: gcoord.GCJ02,
  BD09: gcoord.BD09,
  EPSG3857: gcoord.EPSG3857
} as const

/** 转换单个经纬度点。 */
export function transformPoint(point: [number, number], from: CRS, to: CRS): [number, number] {
  return gcoord.transform(point, CRS_MAP[from], CRS_MAP[to]) as [number, number]
}

/** 转换任意 GeoJSON（点/线/面/集合），返回新对象，不修改入参。 */
export function transformGeoJSON<T>(geojson: T, from: CRS, to: CRS): T {
  const input = structuredClone(geojson) as Parameters<typeof gcoord.transform>[0]
  return gcoord.transform(input, CRS_MAP[from], CRS_MAP[to]) as T
}
