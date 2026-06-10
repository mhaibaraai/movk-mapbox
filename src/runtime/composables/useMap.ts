import { inject } from 'vue'
import type { MapboxContext } from '../types'
import { MapboxContextKey } from '../domains/map/context'

/** 注入当前 MapboxMap 的上下文；必须在 MapboxMap 子树内调用。 */
export function useMap(): MapboxContext {
  const context = inject(MapboxContextKey, null)
  if (!context) {
    throw new Error('[movk-mapbox] useMap() must be called inside a <MapboxMap> component.')
  }
  return context
}
