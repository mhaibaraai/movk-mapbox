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
 * 目标图层所用 source 的数据变化（setData / setTiles 等）且重新加载完成后，在下一次 render 时回调，返回解绑函数。
 * 仅响应 sourceDataType 为 'content' 的事件，瓦片加载不会触发；同一轮多次变化只回调一次。
 * 不依赖 idle：动效组件逐帧重绘时地图不会进入 idle。
 */
export function onLayerDataChange(map: MaplibreMap, layerId: string, handler: () => void): () => void {
  let pendingSource: string | undefined

  function stop(): void {
    map.off('render', onRender)
    pendingSource = undefined
  }

  // content 事件冒泡到地图前，瓦片已被置为重新加载，isSourceLoaded 在新数据就绪后才为 true
  function onRender(): void {
    if (!pendingSource) return
    if (!map.getSource(pendingSource)) return stop()
    if (!map.isSourceLoaded(pendingSource)) return
    stop()
    handler()
  }

  const onSourceData = (event: MapSourceDataEvent): void => {
    if (pendingSource || event.sourceDataType !== 'content') return
    if (event.sourceId !== map.getLayer(layerId)?.source) return
    pendingSource = event.sourceId
    map.on('render', onRender)
  }

  map.on('sourcedata', onSourceData)
  return () => {
    map.off('sourcedata', onSourceData)
    stop()
  }
}
