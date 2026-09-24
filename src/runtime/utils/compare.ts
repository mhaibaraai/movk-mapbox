import { clamp } from '@movk/core'

/** 卷帘分隔方向：vertical 为竖直分隔条左右对比，horizontal 为水平分隔条上下对比 */
export type CompareOrientation = 'vertical' | 'horizontal'

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/** 后图裁切：只露出分隔条之后（右侧或下侧）的部分 */
export function compareClipPath(position: number, orientation: CompareOrientation): string {
  const percent = `${clamp(position, 0, 1) * 100}%`
  return orientation === 'vertical' ? `inset(0 0 0 ${percent})` : `inset(${percent} 0 0 0)`
}

/** 指针坐标换算为分隔条在容器内的比例（0..1） */
export function positionFromPointer(rect: Rect, point: { x: number, y: number }, orientation: CompareOrientation): number {
  const [offset, size] = orientation === 'vertical'
    ? [point.x - rect.left, rect.width]
    : [point.y - rect.top, rect.height]
  return size > 0 ? clamp(offset / size, 0, 1) : 0
}
