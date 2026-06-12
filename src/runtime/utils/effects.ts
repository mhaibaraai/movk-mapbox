export type Position2D = [number, number]

export interface ArcLineOptions {
  /**
   * 弧线弯曲程度（相对两点距离的比例）
   * @defaultValue 0.3
   */
  curvature?: number
  /**
   * 采样段数
   * @defaultValue 64
   */
  segments?: number
}

/** 二次贝塞尔弧线：控制点取中点沿垂直方向偏移 curvature × 距离。 */
export function arcLine(from: Position2D, to: Position2D, options: ArcLineOptions = {}): Position2D[] {
  const curvature = options.curvature ?? 0.3
  const segments = options.segments ?? 64

  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const mid: Position2D = [from[0] + dx / 2, from[1] + dy / 2]
  // 垂直单位向量 × 距离 × 曲率 = 控制点偏移
  const control: Position2D = [mid[0] - dy * curvature, mid[1] + dx * curvature]

  const coords: Position2D[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const a = 1 - t
    coords.push([
      a * a * from[0] + 2 * a * t * control[0] + t * t * to[0],
      a * a * from[1] + 2 * a * t * control[1] + t * t * to[1]
    ])
  }
  // 浮点误差下保证端点精确
  coords[0] = [...from]
  coords[segments] = [...to]
  return coords
}

/**
 * 预计算累计长度的沿线采样器：t ∈ [0,1]（按长度占比）→ 坐标。
 * 供迁徙粒子/轨迹每帧取位，避免逐帧重算长度表。
 */
export function createLineSampler(coords: Position2D[]): (t: number) => Position2D {
  const cumulative: number[] = [0]
  for (let i = 1; i < coords.length; i++) {
    const dx = coords[i]![0] - coords[i - 1]![0]
    const dy = coords[i]![1] - coords[i - 1]![1]
    cumulative.push(cumulative[i - 1]! + Math.hypot(dx, dy))
  }
  const total = cumulative[cumulative.length - 1]!

  return (t: number): Position2D => {
    if (t <= 0 || total === 0) return [...coords[0]!]
    if (t >= 1) return [...coords[coords.length - 1]!]
    const target = t * total
    // 长度表单调递增，线性扫描定位所在段（段数有限，无需二分）
    let i = 1
    while (cumulative[i]! < target) i++
    const segStart = cumulative[i - 1]!
    const ratio = (target - segStart) / (cumulative[i]! - segStart)
    const a = coords[i - 1]!
    const b = coords[i]!
    return [a[0] + (b[0] - a[0]) * ratio, a[1] + (b[1] - a[1]) * ratio]
  }
}

/** 第 ring 圈在当前时刻的扩散相位 [0,1)：线性推进 + 按圈序均匀错相。 */
export function ringProgress(ring: number, rings: number, elapsedMs: number, durationMs: number): number {
  return (elapsedMs / durationMs + ring / rings) % 1
}

/**
 * 轨迹彗尾的 line-gradient 表达式：head 为头部 line-progress，
 * 尾部到头部由透明渐变到主色，头部之后立即透明。停靠点保证严格递增。
 */
export function trailGradient(head: number, trailLength: number, color: string): unknown[] {
  const eps = 1e-4
  const transparent = 'rgba(0, 0, 0, 0)'
  const h = Math.min(Math.max(head, eps), 1)
  const tail = Math.max(h - Math.max(trailLength, eps), 0)

  const expr: unknown[] = ['interpolate', ['linear'], ['line-progress'], tail, transparent, h, color]
  if (h + eps < 1) expr.push(h + eps, transparent)
  return expr
}

/**
 * 生成雷达扇形扫描贴图（透明到主色的角向渐变）。
 * 无 canvas 2d 环境（SSR/测试）时返回 undefined。
 */
export function radarSweepImage(size: number, color: string): ImageData | undefined {
  if (typeof document === 'undefined') return undefined
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return undefined

  const half = size / 2
  // 用细扇形逐步加深近似 conic 渐变，避免依赖 createConicGradient 兼容性
  const steps = 120
  const sweep = Math.PI * 1.5
  for (let i = 0; i < steps; i++) {
    const angle = (i / steps) * sweep
    context.beginPath()
    context.moveTo(half, half)
    context.arc(half, half, half, angle, angle + sweep / steps + 0.01)
    context.closePath()
    context.globalAlpha = (i / steps) * 0.85
    context.fillStyle = color
    context.fill()
  }
  return context.getImageData(0, 0, size, size)
}
