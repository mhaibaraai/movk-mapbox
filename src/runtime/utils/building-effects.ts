type PropBag = Record<string, unknown>

export interface BuildingGradientOptions {
  /** 高度-颜色断点,默认低矮到高耸的蓝紫渐变 */
  stops?: [number, string][]
  /** 整体透明度,默认 0.85 */
  opacity?: number
  /** 显示建筑的最小缩放级别,默认 15 */
  minzoom?: number
}

const DEFAULT_STOPS: [number, string][] = [
  [0, '#1e3a8a'],
  [50, '#3b82f6'],
  [150, '#22d3ee'],
  [300, '#a78bfa']
]

/**
 * 按建筑高度插值着色的 fill-extrusion paint。
 * 复用 building.ts 的 minzoom 高度起伏约定,避免建筑瞬间弹出。
 */
export function buildingGradientPaint(options: BuildingGradientOptions = {}): PropBag {
  const stops = options.stops ?? DEFAULT_STOPS
  const minzoom = options.minzoom ?? 15

  const colorExpr: unknown[] = ['interpolate', ['linear'], ['get', 'height']]
  for (const [height, color] of stops) colorExpr.push(height, color)

  return {
    'fill-extrusion-color': colorExpr,
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
    'fill-extrusion-opacity': options.opacity ?? 0.85
  }
}

export interface WindowTextureOptions {
  /** 贴图边长(像素),默认 128 */
  size?: number
  /** 窗户行数,默认 8 */
  rows?: number
  /** 窗户列数,默认 6 */
  cols?: number
  /** 亮窗颜色,默认 #fde68a */
  litColor?: string
  /** 暗窗/墙体颜色,默认 #1f2937 */
  darkColor?: string
  /** 亮窗比例 0-1,默认 0.45 */
  litRatio?: number
  /** 随机种子(决定亮窗分布,保证可复现),默认 1 */
  seed?: number
}

/**
 * 程序生成窗户点阵贴图,用于 fill-extrusion-pattern。
 * LCG 伪随机由 seed 决定亮窗分布,保证可测;无 canvas 环境返回 undefined。
 */
export function windowTextureImage(options: WindowTextureOptions = {}): ImageData | undefined {
  if (typeof document === 'undefined') return undefined
  const size = options.size ?? 128
  const rows = options.rows ?? 8
  const cols = options.cols ?? 6
  const litColor = options.litColor ?? '#fde68a'
  const darkColor = options.darkColor ?? '#1f2937'
  const litRatio = options.litRatio ?? 0.45

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return undefined

  context.fillStyle = darkColor
  context.fillRect(0, 0, size, size)

  // 线性同余发生器:同 seed 产出确定序列
  let seed = (options.seed ?? 1) >>> 0
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 0xFFFFFFFF
  }

  const cellW = size / cols
  const cellH = size / rows
  const padX = cellW * 0.2
  const padY = cellH * 0.2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      context.fillStyle = rand() < litRatio ? litColor : darkColor
      context.fillRect(c * cellW + padX, r * cellH + padY, cellW - padX * 2, cellH - padY * 2)
    }
  }
  return context.getImageData(0, 0, size, size)
}
