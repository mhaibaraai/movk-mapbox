import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec'
import { getMaplibreConfig } from './config'

/** MapLibre 无内置底图，缺省 style 时实例没有样式，style.load 永不触发；以空白样式兜底（如仅叠加天地图） */
export function blankStyle(): StyleSpecification {
  const { glyphs } = getMaplibreConfig()
  return { version: 8, ...(glyphs ? { glyphs } : {}), sources: {}, layers: [] }
}
