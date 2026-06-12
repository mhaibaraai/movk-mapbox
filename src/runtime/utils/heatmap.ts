type PropBag = Record<string, unknown>

export interface HeatmapPaintOptions {
  /**
   * 权重取值的要素属性
   * @defaultValue 'temperature'
   */
  weightProperty?: string
  /**
   * 权重属性取值范围 [min, max]，线性映射到 0..1 热力权重
   * @defaultValue `[0, 40]`
   */
  weightRange?: [number, number]
  /** 密度-颜色断点 [密度比 0..1, 颜色][]；缺省为蓝→红五档；density 0 处自动透明 */
  colorStops?: [number, string][]
  /**
   * 热力半径（像素）
   * @defaultValue 30
   */
  radius?: number
  /**
   * 热力强度
   * @defaultValue 1
   */
  intensity?: number
  /**
   * 整体不透明度
   * @defaultValue 1
   */
  opacity?: number
}

const DEFAULT_COLOR_STOPS: [number, string][] = [
  [0.2, '#2c7bb6'],
  [0.4, '#00a6ca'],
  [0.6, '#7fbc41'],
  [0.8, '#fdae61'],
  [1, '#d7191c']
]

/**
 * 生成 mapbox heatmap 图层 paint:温度属性经 weightRange 线性映射为热力权重,
 * heatmap-density 经 colorStops 着色(0 处必透明,否则全图铺底色)。
 */
export function heatmapPaint(options: HeatmapPaintOptions = {}): PropBag {
  const weightProperty = options.weightProperty ?? 'temperature'
  const [min, max] = options.weightRange ?? [0, 40]
  const colorStops = options.colorStops ?? DEFAULT_COLOR_STOPS

  const weightExpr: unknown[] = [
    'interpolate', ['linear'], ['get', weightProperty],
    min, 0,
    max, 1
  ]

  const colorExpr: unknown[] = ['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0, 0, 0, 0)']
  for (const [stop, color] of colorStops) colorExpr.push(stop, color)

  return {
    'heatmap-weight': weightExpr,
    'heatmap-intensity': options.intensity ?? 1,
    'heatmap-color': colorExpr,
    'heatmap-radius': options.radius ?? 30,
    'heatmap-opacity': options.opacity ?? 1
  }
}
