type PropBag = Record<string, unknown>

export interface BufferPaintOptions {
  /**
   * 主色
   * @defaultValue '#3b82f6'
   */
  color?: string
  /**
   * 填充不透明度
   * @defaultValue 0.25
   */
  fillOpacity?: number
  /**
   * 描边宽度
   * @defaultValue 2
   */
  lineWidth?: number
}

/** 缓冲区默认 fill/line paint；组件可经 fillPaint/linePaint 整体覆盖。 */
export function bufferPaints(options: BufferPaintOptions = {}): { fill: PropBag, line: PropBag } {
  const color = options.color ?? '#3b82f6'
  return {
    fill: {
      'fill-color': color,
      'fill-opacity': options.fillOpacity ?? 0.25
    },
    line: {
      'line-color': color,
      'line-width': options.lineWidth ?? 2
    }
  }
}
