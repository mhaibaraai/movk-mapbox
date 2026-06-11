export interface DrawThemeOptions {
  /** 非激活态主色,默认 #3b82f6 */
  color?: string
  /** 激活态(绘制/选中)主色,默认 #f59e0b */
  activeColor?: string
  /** 多边形填充不透明度,默认 0.1 */
  fillOpacity?: number
  /** 线宽,默认 2 */
  lineWidth?: number
  /** 顶点圆半径,默认 5 */
  vertexRadius?: number
}

type StyleSpec = Record<string, unknown>

/**
 * 生成完整 mapbox-gl-draw styles 数组,配合 `userProperties: true` 使用:
 * 颜色取 `['coalesce', ['get', 'user_color'], 主题色]`,要素级 user_color 覆盖主题。
 */
export function drawThemeStyles(options: DrawThemeOptions = {}): StyleSpec[] {
  const color = options.color ?? '#3b82f6'
  const activeColor = options.activeColor ?? '#f59e0b'
  const fillOpacity = options.fillOpacity ?? 0.1
  const lineWidth = options.lineWidth ?? 2
  const vertexRadius = options.vertexRadius ?? 5

  // user_color 优先,回退到激活/非激活主题色
  const themed = (active: string) => ['coalesce', ['get', 'user_color'], active]
  const inactive = ['==', 'active', 'false']
  const active = ['==', 'active', 'true']

  return [
    {
      id: 'movk-gl-draw-polygon-fill-inactive',
      type: 'fill',
      filter: ['all', inactive, ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      paint: { 'fill-color': themed(color), 'fill-opacity': fillOpacity }
    },
    {
      id: 'movk-gl-draw-polygon-fill-active',
      type: 'fill',
      filter: ['all', active, ['==', '$type', 'Polygon']],
      paint: { 'fill-color': themed(activeColor), 'fill-opacity': fillOpacity }
    },
    {
      id: 'movk-gl-draw-polygon-stroke-inactive',
      type: 'line',
      filter: ['all', inactive, ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': themed(color), 'line-width': lineWidth }
    },
    {
      id: 'movk-gl-draw-polygon-stroke-active',
      type: 'line',
      filter: ['all', active, ['==', '$type', 'Polygon']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': themed(activeColor), 'line-width': lineWidth, 'line-dasharray': [2, 1] }
    },
    {
      id: 'movk-gl-draw-line-inactive',
      type: 'line',
      filter: ['all', inactive, ['==', '$type', 'LineString'], ['!=', 'mode', 'static']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': themed(color), 'line-width': lineWidth }
    },
    {
      id: 'movk-gl-draw-line-active',
      type: 'line',
      filter: ['all', active, ['==', '$type', 'LineString']],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': themed(activeColor), 'line-width': lineWidth, 'line-dasharray': [2, 1] }
    },
    {
      id: 'movk-gl-draw-vertex-halo',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
      paint: { 'circle-radius': vertexRadius + 2, 'circle-color': '#fff' }
    },
    {
      id: 'movk-gl-draw-vertex',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'vertex'], ['==', '$type', 'Point']],
      paint: { 'circle-radius': vertexRadius, 'circle-color': themed(activeColor) }
    },
    {
      id: 'movk-gl-draw-midpoint',
      type: 'circle',
      filter: ['all', ['==', 'meta', 'midpoint'], ['==', '$type', 'Point']],
      paint: { 'circle-radius': vertexRadius - 2, 'circle-color': themed(activeColor) }
    },
    {
      id: 'movk-gl-draw-point-inactive',
      type: 'circle',
      filter: ['all', inactive, ['==', 'meta', 'feature'], ['==', '$type', 'Point'], ['!=', 'mode', 'static']],
      paint: { 'circle-radius': vertexRadius, 'circle-color': themed(color) }
    },
    {
      id: 'movk-gl-draw-point-active',
      type: 'circle',
      filter: ['all', active, ['==', 'meta', 'feature'], ['==', '$type', 'Point']],
      paint: { 'circle-radius': vertexRadius + 1, 'circle-color': themed(activeColor) }
    }
  ]
}
