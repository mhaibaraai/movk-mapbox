import type { AdministrativeDivision, AdministrativeOptions } from '../types'
import { getJson, TIANDITU_ENDPOINTS, TiandituError } from './tianditu-request'

interface RawCenter {
  lng: number
  lat: number
}

interface RawDistrict {
  gb: string
  name: string
  level: number
  center: RawCenter
  boundary?: string
  children?: RawDistrict[]
}

interface RawAdministrativeResponse {
  status?: number
  message?: string
  data?: {
    district?: RawDistrict[]
  }
}

// 天地图 boundary 是 WKT MULTIPOLYGON 字符串（空格分隔 lng/lat、逗号分隔点、)),(( 分隔多边形），
// 真实省市常含多个不相连的环（如上海洋山港飞地）。解析成与 GeoJSON coordinates 同构的嵌套数组。
function parseWktMultiPolygon(wkt: string): number[][][][] {
  const inner = wkt.replace(/^\s*MULTIPOLYGON\s*\(\(\(/i, '').replace(/\)\)\)\s*$/, '')
  // 顶层按 )),(( 切出各多边形；每个多边形内部按 ),( 切出各环
  return inner.split(/\)\)\s*,\s*\(\(/).map(polygon =>
    polygon.split(/\)\s*,\s*\(/).map(ring =>
      ring.split(',').map((pair) => {
        const [lng, lat] = pair.trim().split(/\s+/).map(Number)
        return [lng!, lat!]
      })
    )
  )
}

function centerPoint(center: RawCenter): [number, number] {
  return [center.lng, center.lat]
}

function toDivision(district: RawDistrict, includeBoundary: boolean): AdministrativeDivision {
  const division: AdministrativeDivision = {
    name: district.name,
    code: district.gb,
    level: district.level,
    center: centerPoint(district.center)
  }
  if (includeBoundary && district.boundary) {
    division.boundary = { type: 'MultiPolygon', coordinates: parseWktMultiPolygon(district.boundary) }
  }
  if (Array.isArray(district.children)) {
    division.children = district.children.map(child => ({
      name: child.name,
      code: child.gb,
      level: child.level,
      center: centerPoint(child.center)
    }))
  }
  return division
}

/** 行政区划查询：按名称（或国标码）查中心点、边界轮廓、下级行政区。 */
export async function administrative(
  keyword: string,
  options: AdministrativeOptions,
  tk: string
): Promise<AdministrativeDivision[]> {
  const includeBoundary = options.boundary ?? true
  const data = await getJson<RawAdministrativeResponse>(TIANDITU_ENDPOINTS.administrative, {
    keyword,
    childLevel: String(options.childLevel ?? 0),
    extensions: String(includeBoundary)
  }, tk)

  if (data.status !== undefined && data.status !== 200) {
    throw new TiandituError(data.status, data.message ?? '天地图行政区划查询失败')
  }
  const districts = data.data?.district
  return Array.isArray(districts) ? districts.map(district => toDivision(district, includeBoundary)) : []
}
