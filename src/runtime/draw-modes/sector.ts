import { sector } from '@turf/sector'
import { distance } from '@turf/distance'
import { bearing as turfBearing } from '@turf/bearing'
import type { DrawCustomMode, DrawPolygon } from '@mapbox/mapbox-gl-draw'
import type { MapMouseEvent } from 'mapbox-gl'
import { cancelFeature, completeFeature, createPolygonFeature, discardIfIncomplete } from './shared'

export interface SectorOptions {
  /**
   * 弧线采样段数
   * @defaultValue 64
   */
  steps?: number
}

export interface SectorState {
  feature: DrawPolygon
  center?: [number, number]
  radiusInM?: number
  bearing1?: number
  steps: number
}

/** 扇形绘制:首击定圆心,再击定半径与起始方位,移动扫角,三击成形。 */
export const drawSectorMode: DrawCustomMode<SectorState, SectorOptions> = {
  onSetup(options) {
    return { feature: createPolygonFeature(this), steps: options?.steps ?? 64 }
  },

  onClick(state, e: MapMouseEvent) {
    const point: [number, number] = [e.lngLat.lng, e.lngLat.lat]
    if (!state.center) {
      state.center = point
      return
    }
    if (state.radiusInM === undefined) {
      state.radiusInM = distance(state.center, point, { units: 'meters' })
      state.bearing1 = turfBearing(state.center, point)
      updateSector(state, state.bearing1)
      return
    }
    // 第三击:固化
    updateSector(state, turfBearing(state.center, point))
    completeFeature(this, state.feature)
  },

  onMouseMove(state, e: MapMouseEvent) {
    if (state.center && state.radiusInM !== undefined) {
      updateSector(state, turfBearing(state.center, [e.lngLat.lng, e.lngLat.lat]))
    }
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

function updateSector(state: SectorState, bearing2: number): void {
  const { center, radiusInM, bearing1 } = state
  if (!center || radiusInM === undefined || bearing1 === undefined) return
  const ring = sector(center, radiusInM, bearing1, bearing2, { steps: state.steps, units: 'meters' }).geometry.coordinates
  state.feature.setCoordinates(ring)
  state.feature.setProperty('center', center)
  state.feature.setProperty('radiusInM', radiusInM)
  state.feature.setProperty('bearing1', bearing1)
  state.feature.setProperty('bearing2', bearing2)
}
