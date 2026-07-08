import type { LineString, MultiPolygon } from 'geojson'

/** 经纬度包围盒 [minx, miny, maxx, maxy]，WGS84。 */
export type Bounds = [number, number, number, number]

/** 地名搜索返回的 POI 点；天地图坐标系 CGCS2000 与 WGS84 兼容，坐标原样透传。 */
export interface Poi {
  name: string
  address?: string
  phone?: string
  /** WGS84 经纬度 [lng, lat] */
  location: [number, number]
  /** POI 类型：101 POI 数据、102 公交站点 */
  poiType?: number
  hotPointID?: string
  province?: string
  city?: string
  county?: string
  typeCode?: string
  typeName?: string
  source?: string
  /** 距中心点距离（仅周边搜索返回，原样字符串，1km 以下为米、以上为千米） */
  distance?: string
}

/** 统计搜索结果（resultType=2）。 */
export interface Statistics {
  /** 命中 POI 总数 */
  count: number
  /** 涉及行政区数量 */
  adminCount: number
  /** 推荐行政区，坐标为 WGS84（天地图 CGCS2000 兼容坐标原样透传） */
  priorityCities: { name: string, count: number, adminCode: string, location: [number, number] }[]
}

/** 行政区搜索结果（resultType=3）。 */
export interface Area {
  name: string
  adminCode: string
  /** 显示级别 1-18 */
  level: number
  /** 中心点 WGS84 [lng, lat] */
  location: [number, number]
  /** 定位范围 [minx, miny, maxx, maxy]，WGS84 */
  bound?: Bounds
}

/** 建议词结果（resultType=4）。 */
export interface Suggestion {
  /** 提示类型：1 是否在 X 搜 Y、2 在 X 无结果、3 多个可跳转行政区、4 城市 */
  type: number
  keyword: string
  admins: { adminName: string, adminCode: string }[]
}

/** 线路结果（resultType=5）。 */
export interface LineResult {
  name: string
  uuid: string
  stationNum?: string
}

/** 单个查询分类的检索结果（category 传多个 dataTypes 时按分类名分组）。 */
export interface CategoryResult {
  /** 查询分类名（来自 dataTypes 中的某一项，天地图按此分组返回） */
  name: string
  /** 该分类命中 POI 总数 */
  count: number
  pois: Poi[]
}

/**
 * 地名搜索归一化结果，按 kind 判别对应 resultType；无数据为 empty。
 * category 传多个 dataTypes 时天地图按分类名分组返回，对应 kind: 'categories'。
 */
export type SearchResult
  = | { kind: 'poi', count: number, pois: Poi[], suggestedDistrict?: SuggestedDistrict }
    | { kind: 'categories', categories: CategoryResult[] }
    | { kind: 'statistics', statistics: Statistics }
    | { kind: 'area', area: Area }
    | { kind: 'suggestion', suggestion: Suggestion }
    | { kind: 'line', lines: LineResult[] }
    | { kind: 'empty' }

/** 天地图从关键词里识别出的行政区建议（伴随 POI 结果返回，可用于收窄二次检索范围）。 */
export interface SuggestedDistrict {
  name: string
  code: string
}

/** 地名搜索公共分页/过滤参数。 */
interface SearchCommon {
  /**
   * 返回结果起始位（分页）
   * @defaultValue 0
   */
  start?: number
  /**
   * 返回条数 1-300
   * @defaultValue 10
   */
  count?: number
  /** POI 分类（分类名或编码，多个用英文逗号分隔） */
  dataTypes?: string
  /** 返回信息类别：1 基本、2 详细 */
  show?: 1 | 2
}

/**
 * 地名搜索参数，按 type 判别对应天地图 queryType：
 * normal(1) / inView(2) / nearby(3) / polygon(10) / district(12) / category(13) / statistics(14)。
 * 所有坐标入参均为 WGS84。
 */
export type SearchParams
  = | ({ type: 'normal', keyword: string, bounds: Bounds, level: number, specify?: string } & SearchCommon)
    | ({ type: 'inView', keyword: string, bounds: Bounds, level: number } & SearchCommon)
    | ({ type: 'nearby', keyword: string, center: [number, number], radius: number } & SearchCommon)
    | ({ type: 'polygon', keyword: string, polygon: [number, number][] } & SearchCommon)
    | ({ type: 'district', specify: string, keyword?: string } & SearchCommon)
    | ({ type: 'category', specify: string, bounds: Bounds, dataTypes: string } & SearchCommon)
    | ({ type: 'statistics', specify: string, keyword?: string } & SearchCommon)

/** 正地理编码（地址→坐标）结果；天地图坐标系 CGCS2000 与 WGS84 兼容，坐标原样透传。 */
export interface GeocodePoint {
  /** WGS84 经纬度 [lng, lat] */
  location: [number, number]
  /** 匹配级别，如「门址」 */
  level?: string
  /** 匹配得分 0-100 */
  score?: number
}

/** 逆地理编码（坐标→地址）结果。 */
export interface ReverseGeocodeResult {
  formattedAddress: string
  province?: string
  city?: string
  county?: string
  road?: string
  poi?: string
}

/** 地名精确定位（locate）选项。 */
export interface LocateOptions {
  /**
   * 自定义检索范围（WGS84 [minx, miny, maxx, maxy]）；已知大致范围时传入可提升排序精度
   * @defaultValue 全国范围
   */
  bounds?: Bounds
  /**
   * 查询级别 1-18
   * @defaultValue 10
   */
  level?: number
  count?: number
}

/** 下级行政区（无边界轮廓）。 */
export interface AdministrativeChild {
  name: string
  code: string
  /** 行政区划级别：国家 5、省 4、市 3、区县 2 */
  level: number
  /** 中心点 WGS84 [lng, lat] */
  center: [number, number]
}

/** 行政区划查询结果。 */
export interface AdministrativeDivision extends AdministrativeChild {
  /** 行政区边界；仅在 boundary 且天地图返回轮廓时存在，坐标为 WGS84（原样透传） */
  boundary?: MultiPolygon
  children?: AdministrativeChild[]
}

/** 行政区划查询选项。 */
export interface AdministrativeOptions {
  /**
   * 下级行政区级数：0 不返回、1 下一级、2 下两级、3 下三级
   * @defaultValue 0
   */
  childLevel?: 0 | 1 | 2 | 3
  /**
   * 是否返回边界轮廓
   * @defaultValue true
   */
  boundary?: boolean
}

/** 驾车/步行路线模式，映射天地图 style：最快 0、最短 1、避开高速 2、步行 3。 */
export type RouteMode = 'fastest' | 'shortest' | 'avoid-highway' | 'walking'

/** 路线规划选项。 */
export interface RouteOptions {
  /**
   * 路线模式
   * @defaultValue 'fastest'
   */
  mode?: RouteMode
  /** 途经点（WGS84），按顺序途经 */
  waypoints?: [number, number][]
}

/** 路线规划结果。 */
export interface RouteResult {
  /** 总距离（公里） */
  distanceKm: number
  /** 总时长（分钟） */
  durationMinutes: number
  /** 整条路线折线（WGS84） */
  path: LineString
  /** 逐段转向文字摘要 */
  summary?: string
  /** 适宜展示整条路线的中心点（WGS84） */
  center?: [number, number]
  /** 适宜缩放级别 */
  scale?: number
}
