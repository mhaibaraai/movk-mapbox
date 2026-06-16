import type { DrawCustomMode, DrawPolygon } from '@mapbox/mapbox-gl-draw'
import type { MapMouseEvent } from 'mapbox-gl'
import { cancelFeature, completeFeature, createPolygonFeature, discardIfIncomplete } from './shared'

export interface RectangleState {
  feature: DrawPolygon
  start?: [number, number]
}

/** 矩形绘制:首击定一角,移动预览,再击成形(经纬轴对齐)。 */
export const drawRectangleMode: DrawCustomMode<RectangleState, object> = {
  onSetup() {
    return { feature: createPolygonFeature(this) }
  },

  onClick(state, e: MapMouseEvent) {
    const point: [number, number] = [e.lngLat.lng, e.lngLat.lat]
    if (!state.start) {
      state.start = point
      return
    }
    updateRectangle(state, point)
    completeFeature(this, state.feature)
  },

  onMouseMove(state, e: MapMouseEvent) {
    if (state.start) updateRectangle(state, [e.lngLat.lng, e.lngLat.lat])
  },

  onKeyUp(state, e: KeyboardEvent) {
    if (e.key === 'Escape') cancelFeature(this, state.feature)
    else if (e.key === 'Enter' && state.start) completeFeature(this, state.feature)
  },

  onStop(state) {
    this.updateUIClasses({ mouse: 'none' })
    discardIfIncomplete(this, state.feature)
  },

  toDisplayFeatures(state, geojson, display) {
    display(geojson)
  }
}

function updateRectangle(state: RectangleState, end: [number, number]): void {
  const [x1, y1] = state.start!
  const [x2, y2] = end
  state.feature.setCoordinates([[[x1, y1], [x2, y1], [x2, y2], [x1, y2], [x1, y1]]])
}
