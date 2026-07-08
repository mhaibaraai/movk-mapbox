import type { GeocodePoint, ReverseGeocodeResult } from '../types'
import { getJson, TIANDITU_ENDPOINTS, TiandituError } from './tianditu-request'

interface RawForwardResponse {
  status?: string
  msg?: string
  location?: { lon: string | number, lat: string | number, level?: string, score?: number }
}

interface RawReverseResponse {
  status?: string
  msg?: string
  result?: {
    formatted_address?: string
    addressComponent?: {
      province?: string
      city?: string
      county?: string
      // 文档写作 road_distince（拼写错误），真实响应是 road_distance；此处只取名称字段
      road?: string
      poi?: string
    }
  }
}

// status: '0' 正常、'101' 空结果、'404' 出错
function assertNotError(status: string | undefined, msg: string | undefined): void {
  if (status === '404') throw new TiandituError('404', msg ?? '天地图地理编码失败')
}

// score 低于此阈值视为不可靠匹配（如纯地标/无门牌号地址常匹配到粗粒度行政区中心点，坐标可能严重偏离）
const MIN_GEOCODE_SCORE = 60

/** 正地理编码：把结构化地址（「北京市海淀区莲花池西路 28 号」）解析为精确坐标点，无结果或低置信度返回 undefined。 */
export async function geocode(address: string, tk: string): Promise<GeocodePoint | undefined> {
  const data = await getJson<RawForwardResponse>(
    TIANDITU_ENDPOINTS.geocoder,
    { ds: JSON.stringify({ keyWord: address }) },
    tk
  )
  assertNotError(data.status, data.msg)
  if (data.status !== '0' || !data.location) return undefined
  if (data.location.score !== undefined && data.location.score < MIN_GEOCODE_SCORE) return undefined

  const location: [number, number] = [Number(data.location.lon), Number(data.location.lat)]
  return { location, level: data.location.level || undefined, score: data.location.score }
}

/** 逆地理编码：把一个 WGS84 坐标点反查为结构化地址（「这是哪里」），无结果返回 undefined。 */
export async function reverseGeocode(
  point: [number, number],
  tk: string
): Promise<ReverseGeocodeResult | undefined> {
  const [lon, lat] = point
  const data = await getJson<RawReverseResponse>(
    TIANDITU_ENDPOINTS.geocoder,
    { postStr: JSON.stringify({ lon, lat, ver: 1 }), type: 'geocode' },
    tk
  )
  assertNotError(data.status, data.msg)
  if (data.status !== '0' || !data.result?.formatted_address) return undefined

  const c = data.result.addressComponent ?? {}
  return {
    formattedAddress: data.result.formatted_address,
    // 直辖市 city 为空串，用 province 兜底
    province: c.province || undefined,
    city: c.city || c.province || undefined,
    county: c.county || undefined,
    road: c.road || undefined,
    poi: c.poi || undefined
  }
}
