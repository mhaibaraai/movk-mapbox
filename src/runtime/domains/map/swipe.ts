import { MapMouseEvent } from 'maplibre-gl'
import type { Map as MaplibreMap } from 'maplibre-gl'

// 对照图 pointer-events: none，交互全部落在主图；露出区域内的鼠标事件转发给对照图，使其图层事件可用
const FORWARDED_EVENTS = ['mousedown', 'mouseup', 'click', 'dblclick', 'mousemove', 'contextmenu'] as const

/**
 * 把对照图绑定到主图：相机、尺寸、投影单向跟随主图，露出区域内的鼠标事件转发给对照图，
 * 对照图设置的光标同步到主图 canvas。返回解绑函数。
 */
export function bindSwipeOverlay(
  main: MaplibreMap,
  overlay: MaplibreMap,
  isRevealed: (point: { x: number, y: number }) => boolean
): () => void {
  const syncCamera = (): void => {
    overlay.jumpTo({
      center: main.getCenter(),
      zoom: main.getZoom(),
      bearing: main.getBearing(),
      pitch: main.getPitch(),
      padding: main.getPadding()
    })
  }
  const syncSize = (): void => {
    overlay.resize()
  }
  const syncProjection = (): void => {
    const projection = main.getProjection()
    if (projection) overlay.setProjection(projection)
  }

  let inside = false
  let mirroredCursor = ''

  function mirrorCursor(): void {
    const cursor = overlay.getCanvas().style.cursor
    if (cursor === mirroredCursor) return
    main.getCanvas().style.cursor = cursor
    mirroredCursor = cursor
  }

  // 离开露出区域：补发 mouseout 让对照图图层的 mouseleave 收尾，并还原同步过去的光标
  function leave(originalEvent: MouseEvent): void {
    if (!inside) return
    inside = false
    overlay.fire(new MapMouseEvent('mouseout', overlay, originalEvent))
    if (mirroredCursor) {
      main.getCanvas().style.cursor = ''
      mirroredCursor = ''
    }
  }

  function forward(event: MapMouseEvent): void {
    if (!isRevealed(event.point)) {
      if (event.type === 'mousemove') leave(event.originalEvent)
      return
    }
    inside = true
    overlay.fire(new MapMouseEvent(event.type, overlay, event.originalEvent))
    if (event.type === 'mousemove') mirrorCursor()
  }

  const onMainOut = (event: MapMouseEvent): void => leave(event.originalEvent)

  main.on('move', syncCamera)
  main.on('resize', syncSize)
  main.on('projectiontransition', syncProjection)
  overlay.on('style.load', syncProjection)
  for (const type of FORWARDED_EVENTS) main.on(type, forward)
  main.on('mouseout', onMainOut)

  return () => {
    main.off('move', syncCamera)
    main.off('resize', syncSize)
    main.off('projectiontransition', syncProjection)
    overlay.off('style.load', syncProjection)
    for (const type of FORWARDED_EVENTS) main.off(type, forward)
    main.off('mouseout', onMainOut)
    if (mirroredCursor) main.getCanvas().style.cursor = ''
  }
}
