import type { Map as MapboxMap } from 'mapbox-gl'

/**
 * 表驱动地绑定地图事件并转发，返回解绑函数。
 * 传入 layerId 时绑定到指定图层（用于图层级交互事件）。
 */
export function bindMapEvents<E extends string>(
  map: MapboxMap,
  events: readonly E[],
  handler: (type: E, event: unknown) => void,
  layerId?: string
): () => void {
  const bound = events.map((type) => {
    const listener = (event: unknown) => handler(type, event)
    if (layerId) {
      map.on(type as never, layerId, listener as never)
    } else {
      map.on(type as never, listener as never)
    }
    return { type, listener }
  })

  return () => {
    for (const { type, listener } of bound) {
      if (layerId) {
        map.off(type as never, layerId, listener as never)
      } else {
        map.off(type as never, listener as never)
      }
    }
  }
}
