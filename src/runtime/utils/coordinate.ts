import gcoord from 'gcoord'

/** 常用坐标系标识，对齐 gcoord 的 CRS 常量 */
export type CRS = 'WGS84' | 'GCJ02' | 'BD09' | 'EPSG3857'

const CRS_MAP = {
  WGS84: gcoord.WGS84,
  GCJ02: gcoord.GCJ02,
  BD09: gcoord.BD09,
  EPSG3857: gcoord.EPSG3857
} as const

export interface TransformOptions {
  /**
   * 输出坐标保留的小数位数，省略则保留完整精度
   */
  precision?: number
}

function roundNum(n: number, precision: number): number {
  const factor = 10 ** precision
  return Math.round(n * factor) / factor
}

/** 递归就地取整嵌套坐标数组（仅作用于 transform 产出的新对象）。 */
function roundCoords(coords: unknown, precision: number): void {
  if (!Array.isArray(coords)) return
  if (typeof coords[0] === 'number') {
    for (let i = 0; i < coords.length; i++) {
      coords[i] = roundNum(coords[i] as number, precision)
    }
    return
  }
  for (const child of coords) roundCoords(child, precision)
}

/** 递归遍历 GeoJSON（集合/要素/几何/几何集合），就地取整其坐标。 */
function roundGeoJSON(node: unknown, precision: number): void {
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>

  if (Array.isArray(obj.features)) {
    for (const feature of obj.features) roundGeoJSON(feature, precision)
  }
  if (obj.geometry) roundGeoJSON(obj.geometry, precision)
  if (Array.isArray(obj.geometries)) {
    for (const geometry of obj.geometries) roundGeoJSON(geometry, precision)
  }
  if (obj.coordinates) roundCoords(obj.coordinates, precision)
}

/** 转换单个经纬度点，返回新坐标。 */
export function transformPoint(
  point: [number, number],
  from: CRS,
  to: CRS,
  options: TransformOptions = {}
): [number, number] {
  const result = gcoord.transform(point, CRS_MAP[from], CRS_MAP[to]) as [number, number]
  if (options.precision === undefined) return result
  return [roundNum(result[0], options.precision), roundNum(result[1], options.precision)]
}

/** 转换任意 GeoJSON（点/线/面/集合），返回新对象，不修改入参。 */
export function transformGeoJSON<T>(geojson: T, from: CRS, to: CRS, options: TransformOptions = {}): T {
  const input = structuredClone(geojson) as Parameters<typeof gcoord.transform>[0]
  const result = gcoord.transform(input, CRS_MAP[from], CRS_MAP[to]) as T

  if (options.precision !== undefined) roundGeoJSON(result, options.precision)

  return result
}
