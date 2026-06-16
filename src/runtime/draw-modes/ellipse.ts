import { ellipse } from '@turf/ellipse'
import { distance } from '@turf/distance'
import type { DrawCustomMode, DrawPolygon } from '@mapbox/mapbox-gl-draw'
import type { MapMouseEvent } from 'mapbox-gl'
import { cancelFeature, completeFeature, createPolygonFeature, discardIfIncomplete } from './shared'

export interface EllipseOptions {
  /**
   * y 半轴与 x 半轴之比
   * @defaultValue 0.6
   */
  ratio?: number
  /**
   * 周长采样段数
   * @defaultValue 64
   */
  steps?: number
}

export interface EllipseState {
  feature: DrawPolygon
  center?: [number, number]
  ratio: number
  steps: number
}

/** 椭圆绘制:首击定中心,移动定 x 半轴(y = x × ratio),再击成形。 */
export const drawEllipseMode: DrawCustomMode<EllipseState, EllipseOptions> = {
  onSetup(options) {
    return {
      feature: createPolygonFeature(this),
      ratio: options?.ratio ?? 0.6,
      steps: options?.steps ?? 64
    }
  },

  onClick(state, e: MapMouseEvent) {
    const point: [number, number] = [e.lngLat.lng, e.lngLat.lat]
    if (!state.center) {
      state.center = point
      return
    }
    updateEllipse(state, point)
    completeFeature(this, state.feature)
  },

  onMouseMove(state, e: MapMouseEvent) {
    if (state.center) updateEllipse(state, [e.lngLat.lng, e.lngLat.lat])
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

function updateEllipse(state: EllipseState, edge: [number, number]): void {
  const center = state.center!
  const xSemiAxisInM = distance(center, edge, { units: 'meters' })
  if (xSemiAxisInM <= 0) return
  const ySemiAxisInM = xSemiAxisInM * state.ratio
  const ring = ellipse(center, xSemiAxisInM, ySemiAxisInM, { steps: state.steps, units: 'meters' }).geometry.coordinates
  state.feature.setCoordinates(ring)
  state.feature.setProperty('center', center)
  state.feature.setProperty('xSemiAxisInM', xSemiAxisInM)
  state.feature.setProperty('ySemiAxisInM', ySemiAxisInM)
}
