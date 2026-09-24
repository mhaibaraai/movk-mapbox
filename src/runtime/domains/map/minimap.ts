import type { IControl, Map as MaplibreMap, MapOptions, StyleSpecification } from 'maplibre-gl'
import { omitUndefined } from '@movk/core'
import { minimapZoom, viewportPolygon } from '../../utils/minimap'
import { createMaplibreGl } from './create-map'

export interface MinimapControlOptions {
  /** 鹰眼样式；省略时沿用主图样式并跟随其切换 */
  style?: StyleSpecification | string
  /** 相对主图的缩放偏移 */
  zoomOffset: number
  /** 宽度（px） */
  width: number
  /** 高度（px） */
  height: number
  /** 视口框颜色 */
  color: string
}

const SOURCE_ID = 'movk-minimap-viewport'
const FILL_ID = `${SOURCE_ID}-fill`
const LINE_ID = `${SOURCE_ID}-line`

/**
 * 鹰眼控件：容器内新建一个非交互的子地图，随主图移动同步相机并绘制主图视口框；
 * 拖拽鹰眼按像素增量平移主图，单击则把主图中心缓动到点击处。
 */
export function createMinimapControl(options: MinimapControlOptions): IControl {
  let parent: MaplibreMap | undefined
  let mini: MaplibreMap | undefined
  let container: HTMLDivElement | undefined

  function sync(): void {
    if (!parent || !mini) return
    mini.jumpTo({ center: parent.getCenter(), zoom: minimapZoom(parent.getZoom(), options.zoomOffset) })
    const source = mini.getSource(SOURCE_ID) as { setData: (data: unknown) => void } | undefined
    source?.setData(viewportPolygon(parent))
  }

  function addViewport(): void {
    if (!mini || !parent) return
    mini.addSource(SOURCE_ID, { type: 'geojson', data: viewportPolygon(parent) })
    mini.addLayer({ id: FILL_ID, type: 'fill', source: SOURCE_ID, paint: { 'fill-color': options.color, 'fill-opacity': 0.15 } })
    mini.addLayer({ id: LINE_ID, type: 'line', source: SOURCE_ID, paint: { 'line-color': options.color, 'line-width': 2 } })
    sync()
  }

  function followParentStyle(): void {
    if (parent && mini) mini.setStyle(parent.getStyle(), { diff: false })
  }

  // 拖拽：记录上一指针位置，按增量平移；未移动即视为单击
  let last: { x: number, y: number } | undefined
  let moved = false

  function onPointerDown(event: PointerEvent): void {
    last = { x: event.clientX, y: event.clientY }
    moved = false
    container?.setPointerCapture?.(event.pointerId)
  }

  function onPointerMove(event: PointerEvent): void {
    if (!last || !parent || !mini) return
    const dx = event.clientX - last.x
    const dy = event.clientY - last.y
    last = { x: event.clientX, y: event.clientY }
    if (!dx && !dy) return
    moved = true
    const origin = mini.project(mini.getCenter())
    parent.jumpTo({ center: mini.unproject([origin.x + dx, origin.y + dy]) })
  }

  function onPointerUp(event: PointerEvent): void {
    if (last && !moved && parent && mini && container) {
      const rect = container.getBoundingClientRect()
      parent.easeTo({ center: mini.unproject([event.clientX - rect.left, event.clientY - rect.top]) })
    }
    last = undefined
  }

  return {
    onAdd(map) {
      parent = map
      container = document.createElement('div')
      container.className = 'maplibregl-ctrl maplibregl-ctrl-group movk-maplibre-minimap'
      container.style.width = `${options.width}px`
      container.style.height = `${options.height}px`

      // 主图样式未就绪时先建空实例，待主图 style.load 再下发
      const style = options.style ?? (map.isStyleLoaded() ? map.getStyle() : undefined)
      mini = createMaplibreGl(omitUndefined({
        container,
        style,
        center: map.getCenter(),
        zoom: minimapZoom(map.getZoom(), options.zoomOffset),
        interactive: false,
        attributionControl: false
      }) as MapOptions)
      mini.on('style.load', addViewport)
      map.on('move', sync)
      if (!options.style) map.on('style.load', followParentStyle)

      container.addEventListener('pointerdown', onPointerDown)
      container.addEventListener('pointermove', onPointerMove)
      container.addEventListener('pointerup', onPointerUp)
      container.addEventListener('pointercancel', onPointerUp)
      return container
    },
    onRemove() {
      parent?.off('move', sync)
      parent?.off('style.load', followParentStyle)
      mini?.remove()
      container?.remove()
      parent = undefined
      mini = undefined
      container = undefined
    }
  }
}
