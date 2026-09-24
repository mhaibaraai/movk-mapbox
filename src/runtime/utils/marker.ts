import { isDeepEqual } from '@movk/core'
import type { Marker, MarkerOptions } from 'maplibre-gl'

export type MarkerInputOptions = Omit<MarkerOptions, 'element'>

function classNames(value?: string): string[] {
  return value?.split(' ').filter(Boolean) ?? []
}

/**
 * 判断选项变化是否需要重建 marker：anchor/color/scale 无 setter，
 * offset 移除后的缺省值取决于是否默认水滴 pin，交由构造函数决定。
 */
export function markerNeedsRebuild(next: MarkerInputOptions, prev: MarkerInputOptions): boolean {
  return next.anchor !== prev.anchor
    || next.color !== prev.color
    || next.scale !== prev.scale
    || (next.offset === undefined && prev.offset !== undefined)
}

/** 移除 className 选项加到 marker 元素上的类（重建复用插槽元素前清理残留） */
export function removeMarkerClassName(marker: Marker, className?: string): void {
  for (const name of classNames(className)) marker.removeClassName(name)
}

/** 以 setter 增量下发有差异的选项，调用方需先经 markerNeedsRebuild 排除无 setter 的字段 */
export function applyMarkerOptions(marker: Marker, next: MarkerInputOptions, prev: MarkerInputOptions): void {
  if (next.draggable !== prev.draggable) marker.setDraggable(next.draggable)
  if (next.rotation !== prev.rotation) marker.setRotation(next.rotation)
  // pitchAlignment 为 auto 时跟随 rotationAlignment，二者需一并下发
  if (next.rotationAlignment !== prev.rotationAlignment || next.pitchAlignment !== prev.pitchAlignment) {
    marker.setRotationAlignment(next.rotationAlignment)
    marker.setPitchAlignment(next.pitchAlignment)
  }
  if (next.offset !== undefined && !isDeepEqual(next.offset, prev.offset)) marker.setOffset(next.offset)
  // 无参调用先复位默认值，避免移除的一项残留旧值
  if (next.opacity !== prev.opacity || next.opacityWhenCovered !== prev.opacityWhenCovered) {
    marker.setOpacity()
    marker.setOpacity(next.opacity, next.opacityWhenCovered)
  }
  if (next.subpixelPositioning !== prev.subpixelPositioning) marker.setSubpixelPositioning(next.subpixelPositioning ?? false)
  if (next.className !== prev.className) {
    removeMarkerClassName(marker, prev.className)
    for (const name of classNames(next.className)) marker.addClassName(name)
  }
}
