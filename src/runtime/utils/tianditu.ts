import type { RasterSourceSpecification } from 'mapbox-gl'
import { getMapboxConfig } from '../domains/map/config'
import { logger } from './logger'
import { wmtsRasterSource } from './wmts'

/** 天地图图层类型：vec 矢量底图、img 影像底图、ter 地形、cva 矢量注记、cia 影像注记、cta 地形注记 */
export type TiandituLayerType = 'vec' | 'img' | 'ter' | 'cva' | 'cia' | 'cta'

// 底图 → 对应注记图层
const ANNOTATION_MAP: Partial<Record<TiandituLayerType, TiandituLayerType>> = {
  vec: 'cva',
  img: 'cia',
  ter: 'cta'
}

/** 取底图对应的注记图层类型；注记类型自身或无对应时返回 undefined。 */
export function tiandituAnnotationFor(base: TiandituLayerType): TiandituLayerType | undefined {
  return ANNOTATION_MAP[base]
}

export interface TiandituSourceOptions {
  /** 天地图 token（tk）；缺省时回退到运行时配置的 tiandituToken */
  tk?: string
  /** 瓦片尺寸，默认 256 */
  tileSize?: number
  /** 子域名数量（t0..t{n-1}），默认 8 */
  subdomains?: number
}

/** 生成天地图球面墨卡托（EPSG:3857）栅格数据源规格，可直接用于 MapboxSource。 */
export function tiandituRasterSource(
  layer: TiandituLayerType,
  options: TiandituSourceOptions = {}
): RasterSourceSpecification {
  const tk = options.tk ?? getMapboxConfig().tiandituToken
  if (!tk) logger.warn('Tianditu token (tk) is missing; tiles may fail to load.')

  // 用 WMTS GetTile
  const count = options.subdomains ?? 8
  const subdomains = Array.from({ length: count }, (_, i) => String(i))

  return wmtsRasterSource({
    url: `https://t{s}.tianditu.gov.cn/${layer}_w/wmts`,
    layer,
    tileMatrixSet: 'w',
    subdomains,
    tileSize: options.tileSize ?? 256,
    attribution: '© 天地图',
    params: { tk: tk ?? '' }
  })
}
