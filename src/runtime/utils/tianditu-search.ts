import type { Area, Bounds, CategoryResult, LineResult, LocateOptions, Poi, SearchParams, SearchResult, Statistics, Suggestion, SuggestedDistrict } from '../types'
import { formatLngLat, getJson, parseLngLat, TIANDITU_ENDPOINTS, TiandituError } from './tianditu-request'

// 全国范围，locate() 未指定 bounds 时的默认检索范围
const CHINA_BOUNDS: Bounds = [73.66, 3.86, 135.05, 53.55]

// type → 天地图 queryType
const QUERY_TYPE: Record<SearchParams['type'], number> = {
  normal: 1,
  inView: 2,
  nearby: 3,
  polygon: 10,
  district: 12,
  category: 13,
  statistics: 14
}

interface RawPoi {
  name: string
  address?: string
  phone?: string
  lonlat: string
  poiType?: number
  hotPointID?: string
  province?: string
  city?: string
  county?: string
  typeCode?: string
  typeName?: string
  source?: string
  distance?: string
}

interface RawSearchResponse {
  resultType?: number
  count?: number
  pois?: RawPoi[]
  statistics?: {
    count?: number
    adminCount?: number
    priorityCitys?: { name: string, count?: number, adminCode?: string, lonlat: string }[]
  }
  area?: { name: string, adminCode?: string | number, level?: number, lonlat: string, bound?: string }
  prompt?: { type?: number, keyword?: string, admins?: { adminName: string, adminCode: string }[] }[]
  lineData?: { name: string, uuid: string, stationNum?: string }[]
  status?: { infocode?: number, cndesc?: string }
}

function boundsToMapBound(bounds: Bounds): string {
  return `${bounds[0]},${bounds[1]},${bounds[2]},${bounds[3]}`
}

function boundFromString(text: string): Bounds {
  const [minx, miny, maxx, maxy] = text.split(',').map(Number)
  return [minx!, miny!, maxx!, maxy!]
}

function toPoi(raw: RawPoi): Poi {
  return {
    name: raw.name,
    address: raw.address || undefined,
    phone: raw.phone || undefined,
    location: parseLngLat(raw.lonlat),
    poiType: raw.poiType,
    hotPointID: raw.hotPointID || undefined,
    province: raw.province || undefined,
    city: raw.city || undefined,
    county: raw.county || undefined,
    typeCode: raw.typeCode || undefined,
    typeName: raw.typeName || undefined,
    source: raw.source || undefined,
    distance: raw.distance || undefined
  }
}

function toStatistics(raw: NonNullable<RawSearchResponse['statistics']>): Statistics {
  return {
    count: raw.count ?? 0,
    adminCount: raw.adminCount ?? 0,
    priorityCities: (raw.priorityCitys ?? []).map(city => ({
      name: city.name,
      count: city.count ?? 0,
      adminCode: String(city.adminCode ?? ''),
      location: parseLngLat(city.lonlat)
    }))
  }
}

function toArea(raw: NonNullable<RawSearchResponse['area']>): Area {
  return {
    name: raw.name,
    adminCode: String(raw.adminCode ?? ''),
    level: raw.level ?? 0,
    location: parseLngLat(raw.lonlat.replace(/[{}]/g, '')),
    bound: raw.bound ? boundFromString(raw.bound) : undefined
  }
}

function toSuggestion(raw: NonNullable<RawSearchResponse['prompt']>[number]): Suggestion {
  return {
    type: raw.type ?? 0,
    keyword: raw.keyword ?? '',
    admins: raw.admins ?? []
  }
}

// 天地图在 resultType=1（POI）响应里常伴随一个 type=4（城市/行政区）建议，
// 是它自己从关键词里识别出的行政区名，可用于二次收窄检索范围
function extractSuggestedDistrict(prompt: RawSearchResponse['prompt']): SuggestedDistrict | undefined {
  const admin = prompt?.find(p => p.type === 4)?.admins?.[0]
  return admin ? { name: admin.adminName, code: String(admin.adminCode) } : undefined
}

function toLines(raw: NonNullable<RawSearchResponse['lineData']>): LineResult[] {
  return raw.map(line => ({ name: line.name, uuid: line.uuid, stationNum: line.stationNum }))
}

// 按 SearchParams 组装天地图 postStr
function buildPostStr(params: SearchParams): Record<string, unknown> {
  const post: Record<string, unknown> = {
    queryType: QUERY_TYPE[params.type],
    start: params.start ?? 0,
    count: params.count ?? 10
  }
  if ('keyword' in params && params.keyword) post.keyWord = params.keyword
  if (params.dataTypes) post.dataTypes = params.dataTypes
  if (params.show) post.show = params.show

  switch (params.type) {
    case 'normal':
      post.mapBound = boundsToMapBound(params.bounds)
      post.level = params.level
      if (params.specify) post.specify = params.specify
      break
    case 'inView':
      post.mapBound = boundsToMapBound(params.bounds)
      post.level = params.level
      break
    case 'nearby':
      post.pointLonlat = formatLngLat(params.center)
      post.queryRadius = params.radius
      break
    case 'polygon':
      post.polygon = params.polygon.map(point => formatLngLat(point)).join(',')
      break
    case 'district':
      post.specify = params.specify
      break
    case 'category':
      post.specify = params.specify
      post.mapBound = boundsToMapBound(params.bounds)
      break
    case 'statistics':
      post.specify = params.specify
      break
  }
  return post
}

function normalize(data: RawSearchResponse): SearchResult {
  switch (data.resultType) {
    case 1:
      return {
        kind: 'poi',
        count: data.count ?? data.pois?.length ?? 0,
        pois: (data.pois ?? []).map(toPoi),
        suggestedDistrict: extractSuggestedDistrict(data.prompt)
      }
    case 2:
      return { kind: 'statistics', statistics: toStatistics(data.statistics ?? {}) }
    case 3:
      if (data.area) return { kind: 'area', area: toArea(data.area) }
      break
    case 4:
      if (data.prompt?.[0]) return { kind: 'suggestion', suggestion: toSuggestion(data.prompt[0]) }
      break
    case 5:
      return { kind: 'line', lines: toLines(data.lineData ?? []) }
  }
  // 无 resultType：区分真错误与空结果（3001 无数据）
  const info = data.status?.infocode
  if (info !== undefined && info !== 1000 && info !== 3001) {
    throw new TiandituError(info, data.status?.cndesc ?? '天地图检索失败')
  }
  return { kind: 'empty' }
}

// category 传多个 dataTypes 时，天地图按分类名分组返回：{ 分类名: { resultType, count, pois } }。
// 该形状仅在所有分类合法时出现（任一非法整个请求 HTTP 400，早在 getJson 抛错），
// 故每个分类恒为成功结果，无数据分类自然得到 count:0/pois:[]。
function normalizeCategories(data: Record<string, RawSearchResponse>): SearchResult {
  const categories: CategoryResult[] = Object.entries(data).map(([name, raw]) => ({
    name,
    count: raw.count ?? 0,
    pois: (raw.pois ?? []).map(toPoi)
  }))
  return { kind: 'categories', categories }
}

/** 地名搜索：一个入口覆盖天地图 7 种 queryType，输出按 resultType 判别归一化。 */
export async function search(params: SearchParams, tk: string): Promise<SearchResult> {
  const data = await getJson<RawSearchResponse | Record<string, RawSearchResponse>>(
    TIANDITU_ENDPOINTS.search,
    { postStr: JSON.stringify(buildPostStr(params)), type: 'query' },
    tk
  )
  // 按响应形状分派：扁平响应必带顶层 resultType 或 status；均无则是 category 多分类的分组对象
  return ('resultType' in data || 'status' in data)
    ? normalize(data as RawSearchResponse)
    : normalizeCategories(data as Record<string, RawSearchResponse>)
}

/** 周边 POI 搜索：给定中心点 + 半径检索附近兴趣点，直接返回 POI 列表。 */
export async function searchNearby(
  keyword: string,
  center: [number, number],
  options: { radius?: number, count?: number, start?: number },
  tk: string
): Promise<Poi[]> {
  const result = await search({
    type: 'nearby',
    keyword,
    center,
    radius: options.radius ?? 5000,
    count: options.count,
    start: options.start
  }, tk)
  return result.kind === 'poi' ? result.pois : []
}

// 精确同名的排最前；天地图按热度/类型排序而非语义相关度，命中量大时同名地标会被挤到后面
function prioritizeExactMatch(pois: Poi[], keyword: string): Poi[] {
  return [...pois].sort((a, b) => Number(b.name === keyword) - Number(a.name === keyword))
}

/**
 * 地名精确定位：全国范围模糊检索命中量大时排序质量会骤降（如关键词带省市前缀），
 * 天地图会随结果附带一个行政区建议（suggestedDistrict）；若调用方未显式指定 bounds，
 * 自动用该建议行政区重新检索一次以收窄范围、提升排序精度，最终对同名结果做精确匹配优先排序。
 */
export async function locate(keyword: string, options: LocateOptions, tk: string): Promise<SearchResult> {
  const autoNarrow = !options.bounds
  const first = await search({
    type: 'normal',
    keyword,
    bounds: options.bounds ?? CHINA_BOUNDS,
    level: options.level ?? 10,
    count: options.count
  }, tk)

  if (first.kind !== 'poi') return first

  if (autoNarrow && first.suggestedDistrict && first.pois.length > 0) {
    const narrowed = await search({ type: 'district', specify: first.suggestedDistrict.code, keyword, count: options.count }, tk)
    if (narrowed.kind === 'poi' && narrowed.pois.length > 0) {
      return { ...narrowed, pois: prioritizeExactMatch(narrowed.pois, keyword) }
    }
  }

  return { ...first, pois: prioritizeExactMatch(first.pois, keyword) }
}
