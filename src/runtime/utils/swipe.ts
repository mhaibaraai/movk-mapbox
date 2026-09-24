import { clamp } from '@movk/core'

/** 卷帘分隔方向：vertical 为竖直分隔条左右对比，horizontal 为水平分隔条上下对比 */
export type SwipeOrientation = 'vertical' | 'horizontal'

interface Point {
  x: number
  y: number
}

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

/** 对照图裁切：只露出分隔条之后（右侧或下侧）的部分 */
export function swipeClipPath(position: number, orientation: SwipeOrientation): string {
  const percent = `${clamp(position, 0, 1) * 100}%`
  return orientation === 'vertical' ? `inset(0 0 0 ${percent})` : `inset(${percent} 0 0 0)`
}

/** 指针坐标换算为分隔条在容器内的比例（0..1） */
export function positionFromPointer(rect: Rect, point: Point, orientation: SwipeOrientation): number {
  const [offset, size] = orientation === 'vertical'
    ? [point.x - rect.left, rect.width]
    : [point.y - rect.top, rect.height]
  return size > 0 ? clamp(offset / size, 0, 1) : 0
}

/** 容器内的点是否落在对照图露出区域（分隔条上视为露出） */
export function isPointRevealed(
  point: Point,
  size: { width: number, height: number },
  position: number,
  orientation: SwipeOrientation
): boolean {
  const ratio = clamp(position, 0, 1)
  return orientation === 'vertical' ? point.x >= ratio * size.width : point.y >= ratio * size.height
}

interface AttributionSource {
  getStyle: () => { sources?: object } | undefined
  getSource: (id: string) => { attribution?: string } | undefined
}

/** 汇总地图各来源的署名，按来源顺序去重 */
export function collectAttributions(map: AttributionSource): string[] {
  const ids = Object.keys(map.getStyle()?.sources ?? {})
  const texts = ids
    .map(id => map.getSource(id)?.attribution?.trim())
    .filter((text): text is string => Boolean(text))
  return [...new Set(texts)]
}
