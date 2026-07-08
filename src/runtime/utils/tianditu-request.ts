// 天地图 Web 服务共享请求核心：端点常量、GET 请求（JSON / XML）、tk 注入、坐标串解析、错误类型。
// 各接口封装（search / geocoder / administrative / route）复用此处，避免请求装配三处重写。

export const TIANDITU_ENDPOINTS = {
  search: 'https://api.tianditu.gov.cn/v2/search',
  // 正/逆地理编码共用此路径（无 /v2），通过 type/ds 参数区分
  geocoder: 'https://api.tianditu.gov.cn/geocoder',
  administrative: 'https://api.tianditu.gov.cn/v2/administrative',
  // 驾车/步行规划，返回 XML
  drive: 'https://api.tianditu.gov.cn/drive'
} as const

/** 天地图接口返回异常状态码时抛出；无数据/空结果不属于此类，按空值正常返回。 */
export class TiandituError extends Error {
  /** 天地图状态码（检索 infocode、地理编码 status、行政区 status 或 HTTP 状态码） */
  readonly code: number | string

  constructor(code: number | string, message: string) {
    super(message)
    this.name = 'TiandituError'
    this.code = code
  }
}

async function buildUrl(endpoint: string, params: Record<string, string>, tk: string): Promise<URL> {
  const url = new URL(endpoint)
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  url.searchParams.set('tk', tk)
  return url
}

/** 发起 GET 请求并按 JSON 解析。HTTP 非 2xx 抛 TiandituError。 */
export async function getJson<T>(endpoint: string, params: Record<string, string>, tk: string): Promise<T> {
  const url = await buildUrl(endpoint, params, tk)
  const res = await fetch(url)
  if (!res.ok) throw new TiandituError(res.status, `天地图请求失败：HTTP ${res.status}`)
  return await res.json() as T
}

/** 发起 GET 请求并返回原始文本（驾车规划返回 XML）。HTTP 非 2xx 抛 TiandituError。 */
export async function getText(endpoint: string, params: Record<string, string>, tk: string): Promise<string> {
  const url = await buildUrl(endpoint, params, tk)
  const res = await fetch(url)
  if (!res.ok) throw new TiandituError(res.status, `天地图请求失败：HTTP ${res.status}`)
  return await res.text()
}

/** 解析天地图 "经度,纬度" 字符串为坐标点（未做坐标系转换）。 */
export function parseLngLat(text: string): [number, number] {
  const [lng, lat] = text.trim().split(',').map(Number)
  return [lng!, lat!]
}

/** 将坐标点格式化为天地图 "经度,纬度" 字符串。 */
export function formatLngLat(point: [number, number]): string {
  return `${point[0]},${point[1]}`
}
