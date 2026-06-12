export interface SpriteGrid {
  /** 雪碧图列数 */
  columns: number
  /**
   * 雪碧图行数
   * @defaultValue 1
   */
  rows?: number
  /** 单帧宽（像素） */
  frameWidth: number
  /** 单帧高（像素） */
  frameHeight: number
  /** 总帧数；缺省为 columns * rows */
  frames?: number
}

export interface FrameRect {
  x: number
  y: number
  w: number
  h: number
}

/**
 * 计算雪碧图中第 index 帧的裁剪矩形(行优先排布)。
 * index 越界按总帧数回绕,支持负数。
 */
export function spriteFrameRect(index: number, grid: SpriteGrid): FrameRect {
  const rows = grid.rows ?? 1
  const total = grid.frames ?? grid.columns * rows
  const i = ((index % total) + total) % total
  const col = i % grid.columns
  const row = Math.floor(i / grid.columns)
  return {
    x: col * grid.frameWidth,
    y: row * grid.frameHeight,
    w: grid.frameWidth,
    h: grid.frameHeight
  }
}

/**
 * 从已加载的雪碧图裁剪一帧到 size×size 画布,返回 ImageData。
 * 无 canvas 2d 环境(SSR/测试)返回 undefined。
 */
export function spriteFrame(source: CanvasImageSource, rect: FrameRect, size: number): ImageData | undefined {
  if (typeof document === 'undefined') return undefined
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return undefined
  context.drawImage(source, rect.x, rect.y, rect.w, rect.h, 0, 0, size, size)
  return context.getImageData(0, 0, size, size)
}
