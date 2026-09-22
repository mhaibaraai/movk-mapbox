import { inject } from 'vue'
import type { MaplibreContext } from '../types'
import { MaplibreContextKey } from '../domains/map/context'

/** 注入当前 MaplibreMap 的上下文；必须在 MaplibreMap 子树内调用。 */
export function useMap(): MaplibreContext {
  const context = inject(MaplibreContextKey, null)
  if (!context) {
    throw new Error('[movk-maplibre] useMap() must be called inside a <MaplibreMap> component.')
  }
  return context
}
