import { equalsBy } from '@movk/core'
import type { Map as MapboxMap } from 'mapbox-gl'

type PropBag = Record<string, unknown>

export interface LayerUpdate {
  id: string
  paint?: PropBag
  layout?: PropBag
  filter?: unknown
  minzoom?: number
  maxzoom?: number
}

// 仅对发生变化的属性调用 setter，避免无谓重绘
function applyChangedProps(next: PropBag, prev: PropBag, apply: (key: string, value: unknown) => void): void {
  for (const key of Object.keys(next)) {
    if (!equalsBy(next[key], prev[key])) apply(key, next[key])
  }
}

/** 把图层的响应式变更（缩放范围、paint、layout、filter）增量应用到地图。 */
export function applyLayerProps(map: MapboxMap, next: LayerUpdate, prev?: LayerUpdate): void {
  const id = next.id

  if (next.minzoom !== prev?.minzoom || next.maxzoom !== prev?.maxzoom) {
    map.setLayerZoomRange(id, next.minzoom ?? 0, next.maxzoom ?? 24)
  }

  applyChangedProps(next.paint ?? {}, prev?.paint ?? {}, (key, value) => map.setPaintProperty(id, key as never, value as never))
  applyChangedProps(next.layout ?? {}, prev?.layout ?? {}, (key, value) => map.setLayoutProperty(id, key as never, value as never))

  if (!equalsBy(next.filter, prev?.filter)) {
    map.setFilter(id, next.filter as never)
  }
}
