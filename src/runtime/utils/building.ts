import type { FillExtrusionLayerSpecification } from '@maplibre/maplibre-gl-style-spec'

type PropBag = Record<string, unknown>

/** 建筑数据来源：矢量瓦片或 GeoJSON 中带高度属性的面要素 */
export interface BuildingSourceOptions {
  /** 数据源 id（需已由 MaplibreSource 或样式声明） */
  source: string
  /** 矢量瓦片中的图层名（如 OpenMapTiles 的 'building'）；GeoJSON 源省略 */
  sourceLayer?: string
  /**
   * 建筑高度属性名
   * @defaultValue 'render_height'
   */
  heightProperty?: string
  /**
   * 建筑底面高度属性名
   * @defaultValue 'render_min_height'
   */
  baseProperty?: string
}

export interface BuildingLayerOptions extends BuildingSourceOptions {
  /** 图层 id */
  id: string
  /**
   * 建筑颜色
   * @defaultValue '#aaa'
   */
  color?: string
  /**
   * 整体透明度
   * @defaultValue 0.8
   */
  opacity?: number
  /**
   * 显示建筑的最小缩放级别
   * @defaultValue 15
   */
  minzoom?: number
  /** 整体覆盖 paint（提供时忽略 color/opacity 预设） */
  paint?: PropBag
}

export const DEFAULT_HEIGHT_PROPERTY = 'render_height'
export const DEFAULT_BASE_PROPERTY = 'render_min_height'

/**
 * 建筑拉伸的高度与底面 paint：进入 minzoom 后 0.05 级内由 0 插值到真实高度，避免建筑瞬间弹出。
 */
export function buildingExtrusionPaint(options: { minzoom?: number, heightProperty?: string, baseProperty?: string } = {}): PropBag {
  const minzoom = options.minzoom ?? 15
  const rise = (property: string) => ['interpolate', ['linear'], ['zoom'], minzoom, 0, minzoom + 0.05, ['get', property]]
  return {
    'fill-extrusion-height': rise(options.heightProperty ?? DEFAULT_HEIGHT_PROPERTY),
    'fill-extrusion-base': rise(options.baseProperty ?? DEFAULT_BASE_PROPERTY)
  }
}

/** 生成 3D 建筑 fill-extrusion 图层规格。 */
export function buildingLayerSpec(options: BuildingLayerOptions): FillExtrusionLayerSpecification {
  const minzoom = options.minzoom ?? 15
  const defaultPaint: PropBag = {
    'fill-extrusion-color': options.color ?? '#aaa',
    ...buildingExtrusionPaint({ minzoom, heightProperty: options.heightProperty, baseProperty: options.baseProperty }),
    'fill-extrusion-opacity': options.opacity ?? 0.8
  }

  return {
    id: options.id,
    type: 'fill-extrusion',
    source: options.source,
    ...(options.sourceLayer ? { 'source-layer': options.sourceLayer } : {}),
    minzoom,
    paint: (options.paint ?? defaultPaint) as FillExtrusionLayerSpecification['paint']
  }
}
