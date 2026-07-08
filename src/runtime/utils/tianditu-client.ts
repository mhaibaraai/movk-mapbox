import type {
  AdministrativeDivision,
  AdministrativeOptions,
  GeocodePoint,
  LocateOptions,
  Poi,
  ReverseGeocodeResult,
  RouteOptions,
  RouteResult,
  SearchParams,
  SearchResult
} from '../types'
import { administrative } from './tianditu-administrative'
import { geocode, reverseGeocode } from './tianditu-geocoder'
import { route } from './tianditu-route'
import { locate, search, searchNearby } from './tianditu-search'

/** 天地图 Web 服务客户端；tk 在创建时注入一次，各方法无需重复传递。 */
export interface TiandituClient {
  /** 地名搜索：一个入口覆盖 7 种 queryType，输出按 resultType 判别归一化。 */
  search: (params: SearchParams) => Promise<SearchResult>
  /**
   * 地名精确定位：适用于“把一个地标/地名解析为最佳匹配点”场景（与通用 search 不同，
   * 未传 bounds 时会自动利用天地图返回的行政区建议二次收窄范围、并对同名结果做精确匹配优先排序）。
   */
  locate: (keyword: string, options?: LocateOptions) => Promise<SearchResult>
  /** 周边 POI 搜索：给定中心点 + 半径检索附近兴趣点。 */
  searchNearby: (keyword: string, center: [number, number], options?: { radius?: number, count?: number, start?: number }) => Promise<Poi[]>
  /** 正地理编码：结构化地址→精确坐标点。 */
  geocode: (address: string) => Promise<GeocodePoint | undefined>
  /** 逆地理编码：WGS84 坐标点→结构化地址。 */
  reverseGeocode: (point: [number, number]) => Promise<ReverseGeocodeResult | undefined>
  /** 行政区划查询：中心点、边界轮廓、下级行政区。 */
  administrative: (keyword: string, options?: AdministrativeOptions) => Promise<AdministrativeDivision[]>
  /** 驾车/步行路线规划：真实道路路径与距离/时长。 */
  route: (origin: [number, number], destination: [number, number], options?: RouteOptions) => Promise<RouteResult>
}

/** 创建天地图 Web 服务客户端，绑定 tk 后返回各接口方法。 */
export function createTianditu(options: { tk: string }): TiandituClient {
  const { tk } = options
  return {
    search: params => search(params, tk),
    locate: (keyword, opts) => locate(keyword, opts ?? {}, tk),
    searchNearby: (keyword, center, opts) => searchNearby(keyword, center, opts ?? {}, tk),
    geocode: address => geocode(address, tk),
    reverseGeocode: point => reverseGeocode(point, tk),
    administrative: (keyword, opts) => administrative(keyword, opts ?? {}, tk),
    route: (origin, destination, opts) => route(origin, destination, opts ?? {}, tk)
  }
}

export { TiandituError } from './tianditu-request'
