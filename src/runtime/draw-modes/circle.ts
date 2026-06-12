import { circle } from '@turf/circle'
import { distance } from '@turf/distance'
import type { DrawCustomMode, DrawPolygon } from '@mapbox/mapbox-gl-draw'
import type { MapMouseEvent } from 'mapbox-gl'
import { cancelFeature, completeFeature, createPolygonFeature, discardIfIncomplete } from './shared'

interface CircleOptions {
  /**
   * 圆周采样段数
   * @defaultValue 64
   */
  steps?: number
}

interface CircleState {
  feature: DrawPolygon
  center?: [number, number]
  steps: number
}

/** 圆绘制:首击定圆心,移动定半径,再击成形。properties 记录 center/radiusInM。 */
export const drawCircleMode: DrawCustomMode<CircleState, CircleOptions> = {
  onSetup(options) {
    return { feature: createPolygonFeature(this), steps: options?.steps ?? 64 }
  },

  onClick(state, e: MapMouseEvent) {
    const point: [number, number] = [e.lngLat.lng, e.lngLat.lat]
    if (!state.center) {
      state.center = point
      return
    }
    updateCircle(state, point)
    completeFeature(this, state.feature)
  },

  onMouseMove(state, e: MapMouseEvent) {
    if (state.center) updateCircle(state, [e.lngLat.lng, e.lngLat.lat])
  },

  onKeyUp(state, e: KeyboardEvent) {
    if (e.key === 'Escape') cancelFeature(this, state.feature)
  },

  onStop(state) {
    this.updateUIClasses({ mouse: 'none' })
    discardIfIncomplete(this, state.feature)
  },

  toDisplayFeatures(state, geojson, display) {
    display(geojson)
  }
}

function updateCircle(state: CircleState, edge: [number, number]): void {
  const center = state.center!
  const radiusInM = distance(center, edge, { units: 'meters' })
  if (radiusInM <= 0) return
  const ring = circle(center, radiusInM, { steps: state.steps, units: 'meters' }).geometry.coordinates
  state.feature.setCoordinates(ring)
  state.feature.setProperty('center', center)
  state.feature.setProperty('radiusInM', radiusInM)
}
