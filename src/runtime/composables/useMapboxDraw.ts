import { inject } from 'vue'
import type { ShallowRef } from 'vue'
import type MapboxDraw from '@mapbox/mapbox-gl-draw'
import { DrawKey } from '../domains/map/draw'

/** 注入当前 MapboxDrawControl 的绘制实例；必须在其子树内调用。 */
export function useMapboxDraw(): ShallowRef<MapboxDraw | undefined> {
  const draw = inject(DrawKey, null)
  if (!draw) {
    throw new Error('[movk-mapbox] useMapboxDraw() must be called inside a <MapboxDrawControl> component.')
  }
  return draw
}
