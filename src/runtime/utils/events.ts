import type { MapSourceDataEvent, Map as MaplibreMap } from 'maplibre-gl'

/**
 * 表驱动地绑定地图事件并转发，返回解绑函数。
 * 传入 layerId 时绑定到指定图层（用于图层级交互事件）。
 */
export function bindMapEvents<E extends string>(
  map: MaplibreMap,
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

/**
 * 目标图层所用 source 的数据变化（setData / setTiles 等）且重新渲染完成后回调，返回解绑函数。
 * 仅响应 sourceDataType 为 'content' 的事件，瓦片加载不会触发；同一轮多次变化只回调一次。
 */
export function onLayerDataChange(map: MaplibreMap, layerId: string, handler: () => void): () => void {
  let pending = false

  const onIdle = (): void => {
    pending = false
    handler()
  }

  const onSourceData = (event: MapSourceDataEvent): void => {
    if (pending || event.sourceDataType !== 'content') return
    if (event.sourceId !== map.getLayer(layerId)?.source) return
    pending = true
    map.once('idle', onIdle)
  }

  map.on('sourcedata', onSourceData)
  return () => {
    map.off('sourcedata', onSourceData)
    if (pending) map.off('idle', onIdle)
    pending = false
  }
}
