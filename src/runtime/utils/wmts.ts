import type { RasterSourceSpecification } from 'mapbox-gl'

export interface WmtsSourceOptions {
  /** WMTS 服务基础地址（GetTile 端点）；含 {s} 时配合 subdomains 展开多 host */
  url: string
  /** 图层标识 LAYER */
  layer: string
  /** 瓦片矩阵集 TILEMATRIXSET，默认 'w'（球面墨卡托 EPSG:3857） */
  tileMatrixSet?: string
  /** 样式 STYLE，默认 'default' */
  style?: string
  /** 瓦片格式 FORMAT，默认 'tiles' */
  format?: string
  /** 子域名列表，替换 url 中的 {s} 展开为多条 tiles */
  subdomains?: string[]
  /** 瓦片尺寸，默认 256 */
  tileSize?: number
  /** 版权信息 */
  attribution?: string
  /** 透传查询参数（如 { tk } 等鉴权参数） */
  params?: Record<string, string | undefined>
}

// 拼接查询串：{x}/{y}/{z} 占位符须保持不编码，故手工拼接而非 URLSearchParams
function buildTileUrl(base: string, options: WmtsSourceOptions): string {
  const query = new Map<string, string>([
    ['SERVICE', 'WMTS'],
    ['REQUEST', 'GetTile'],
    ['VERSION', '1.0.0'],
    ['LAYER', options.layer],
    ['STYLE', options.style ?? 'default'],
    ['TILEMATRIXSET', options.tileMatrixSet ?? 'w'],
    ['FORMAT', options.format ?? 'tiles'],
    ['TILEMATRIX', '{z}'],
    ['TILEROW', '{y}'],
    ['TILECOL', '{x}']
  ])
  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value !== undefined) query.set(key, value)
  }
  const qs = Array.from(query, ([k, v]) => `${k}=${v}`).join('&')
  return `${base}${base.includes('?') ? '&' : '?'}${qs}`
}

/** 构造 WMTS GetTile（KVP）栅格数据源规格，可直接用于 MapboxSource。 */
export function wmtsRasterSource(options: WmtsSourceOptions): RasterSourceSpecification {
  const { subdomains } = options
  const tiles = subdomains?.length && options.url.includes('{s}')
    ? subdomains.map(s => buildTileUrl(options.url.replace('{s}', s), options))
    : [buildTileUrl(options.url, options)]

  return {
    type: 'raster',
    tiles,
    tileSize: options.tileSize ?? 256,
    ...(options.attribution ? { attribution: options.attribution } : {})
  }
}
