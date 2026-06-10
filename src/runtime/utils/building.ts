import type { FillExtrusionLayerSpecification } from 'mapbox-gl'

type PropBag = Record<string, unknown>

export interface BuildingLayerOptions {
  /** 图层 id */
  id: string
  /** 矢量数据源 id，默认 Mapbox 官方样式的 composite */
  source?: string
  /** 数据源图层名，默认 building */
  sourceLayer?: string
  /** 建筑颜色，默认 #aaa */
  color?: string
  /** 整体透明度，默认 0.8 */
  opacity?: number
  /** 显示建筑的最小缩放级别，默认 15 */
  minzoom?: number
  /** 整体覆盖 paint（提供时忽略 color/opacity 预设） */
  paint?: PropBag
}

/**
 * 生成 3D 建筑 fill-extrusion 图层规格。
 * 依赖 Mapbox 官方样式的 composite/building 矢量源；天地图等空样式下无效。
 */
export function buildingLayerSpec(options: BuildingLayerOptions): FillExtrusionLayerSpecification {
  const minzoom = options.minzoom ?? 15
  // 进入 minzoom 后 0.05 级内由 0 插值到真实高度，避免建筑瞬间弹出
  const defaultPaint: PropBag = {
    'fill-extrusion-color': options.color ?? '#aaa',
    'fill-extrusion-height': [
      'interpolate', ['linear'], ['zoom'],
      minzoom, 0,
      minzoom + 0.05, ['get', 'height']
    ],
    'fill-extrusion-base': [
      'interpolate', ['linear'], ['zoom'],
      minzoom, 0,
      minzoom + 0.05, ['get', 'min_height']
    ],
    'fill-extrusion-opacity': options.opacity ?? 0.8
  }

  return {
    'id': options.id,
    'type': 'fill-extrusion',
    'source': options.source ?? 'composite',
    'source-layer': options.sourceLayer ?? 'building',
    'filter': ['==', 'extrude', 'true'],
    minzoom,
    'paint': (options.paint ?? defaultPaint) as FillExtrusionLayerSpecification['paint']
  }
}
