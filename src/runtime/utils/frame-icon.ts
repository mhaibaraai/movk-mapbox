import type { Map as MapboxMap, StyleImageInterface } from 'mapbox-gl'

/**
 * 按经过时间选当前帧索引。
 * 有 durations(每帧 ms,长度=total)按累积时长循环选帧;否则按固定 fps。
 */
export function pickFrameIndex(elapsedMs: number, durations: number[] | undefined, fps: number, total: number): number {
  if (total <= 0) return 0
  if (durations && durations.length === total) {
    const cycle = durations.reduce((sum, d) => sum + d, 0)
    if (cycle <= 0) return 0
    let t = elapsedMs % cycle
    for (let i = 0; i < total; i++) {
      if (t < durations[i]!) return i
      t -= durations[i]!
    }
    return total - 1
  }
  return Math.floor((elapsedMs / 1000) * fps) % total
}

export interface FrameStyleImageOptions {
  /** 纹理边长(像素),帧统一缩放到 size×size */
  size: number
  /** 当前帧序列(响应式取值) */
  frames: () => ImageData[]
  /** 取地图实例以触发重绘 */
  getMap: () => MapboxMap | undefined
  /**
   * 固定帧率；durations 缺省时生效
   * @defaultValue 12
   */
  fps?: number
  /** 每帧时长 ms（响应式取值），优先于 fps */
  durations?: () => number[] | undefined
}

/**
 * 构造帧动画 StyleImageInterface:mapbox 每帧调 render 取当前帧并自重绘。
 * 帧未就绪时首次返回 true 以初始透明 data 建立纹理(mapbox 仅在 render 首次返回 true 时建纹理),
 * 避免 symbol 图层 styleimagemissing。
 */
export function createFrameStyleImage(options: FrameStyleImageOptions): StyleImageInterface {
  const { size, frames, getMap } = options
  const fps = options.fps ?? 12
  let start = 0
  let lastIndex = -1
  let committed = false
  const image: StyleImageInterface = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    render() {
      const fs = frames()
      const total = fs.length
      if (!total) {
        if (committed) return false
        committed = true
        return true
      }
      const map = getMap()
      if (map) map.triggerRepaint()
      committed = true
      if (!start) start = performance.now()
      const index = pickFrameIndex(performance.now() - start, options.durations?.(), fps, total)
      if (index === lastIndex) return false
      lastIndex = index
      image.data = fs[index]!.data
      return true
    }
  }
  return image
}
