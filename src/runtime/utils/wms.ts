import type { RasterSourceSpecification } from 'mapbox-gl'

export interface WmsSourceOptions {
  /** WMS 服务基础地址（GetMap 端点） */
  url: string
  /** 图层 LAYERS（逗号分隔多层） */
  layers: string
  /** WMS 版本，默认 '1.1.1'；1.3.0 用 CRS、否则用 SRS */
  version?: string
  /** 图片格式 FORMAT，默认 'image/png' */
  format?: string
  /** 是否透明 TRANSPARENT，默认 true */
  transparent?: boolean
  /** 样式 STYLES，默认 '' */
  styles?: string
  /** 坐标参考系，默认 'EPSG:3857' */
  crs?: string
  /** 瓦片尺寸（WIDTH/HEIGHT），默认 256 */
  tileSize?: number
  /** 版权信息 */
  attribution?: string
  /** 透传查询参数 */
  params?: Record<string, string | undefined>
}

/** 构造 WMS GetMap 栅格数据源规格；mapbox 用 {bbox-epsg-3857} 占位符按瓦片请求。 */
export function wmsRasterSource(options: WmsSourceOptions): RasterSourceSpecification {
  const version = options.version ?? '1.1.1'
  const crs = options.crs ?? 'EPSG:3857'
  const size = options.tileSize ?? 256
  // 1.3.0 用 CRS，更早版本用 SRS
  const crsKey = version === '1.3.0' ? 'CRS' : 'SRS'

  const query = new Map<string, string>([
    ['SERVICE', 'WMS'],
    ['REQUEST', 'GetMap'],
    ['VERSION', version],
    ['LAYERS', options.layers],
    ['STYLES', options.styles ?? ''],
    ['FORMAT', options.format ?? 'image/png'],
    ['TRANSPARENT', String(options.transparent ?? true).toUpperCase()],
    [crsKey, crs],
    ['WIDTH', String(size)],
    ['HEIGHT', String(size)],
    ['BBOX', '{bbox-epsg-3857}']
  ])
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value !== undefined) query.set(key, value)
  }
  const qs = Array.from(query, ([k, v]) => `${k}=${v}`).join('&')
  const url = `${options.url}${options.url.includes('?') ? '&' : '?'}${qs}`

  return {
    type: 'raster',
    tiles: [url],
    tileSize: size,
    ...(options.attribution ? { attribution: options.attribution } : {})
  }
}
