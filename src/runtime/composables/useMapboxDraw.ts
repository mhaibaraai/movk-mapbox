import { computed, inject } from 'vue'
import { DrawKey } from '../domains/map/draw'
import { getDrawContext } from '../domains/map/draw-registry'
import type { MapboxDrawContext } from '../types'
import { logger } from '../utils/logger'

export interface UseMapboxDrawOptions {
  /** 目标地图 id；在 MapboxDrawControl 子树外使用时必填 */
  mapId?: string
}

/**
 * 子树外门面：每次调用时查注册表（门面可能先于控件挂载而构造）。
 * 写/读操作在控件未注册时告警并降级，whenReady 则明确 reject，不返回永不 resolve 的 promise。
 */
function createRemoteContext(mapId: string): MapboxDrawContext {
  function resolve(action: string): MapboxDrawContext | undefined {
    const context = getDrawContext(mapId)
    if (!context) logger.warn(`useMapboxDraw: no <MapboxDrawControl> registered for map "${mapId}"; ${action} ignored.`)
    return context
  }

  return {
    mapId,
    draw: computed(() => getDrawContext(mapId)?.draw.value),
    whenReady() {
      const context = getDrawContext(mapId)
      return context
        ? context.whenReady()
        : Promise.reject(new Error(`[movk-mapbox] no <MapboxDrawControl> registered for map "${mapId}".`))
    },
    changeMode: async mode => resolve('changeMode')?.changeMode(mode),
    add: async geojson => (await resolve('add')?.add(geojson)) ?? [],
    deleteAll: async () => resolve('deleteAll')?.deleteAll(),
    setFeatureProperty: async (featureId, property, value) =>
      resolve('setFeatureProperty')?.setFeatureProperty(featureId, property, value),
    // 读操作静默降级：常在 computed 中反复求值，告警会刷屏
    getAll: () => getDrawContext(mapId)?.getAll(),
    getMode: () => getDrawContext(mapId)?.getMode()
  }
}

/**
 * 获取绘制上下文：省略 mapId 时注入最近的 MapboxDrawControl，
 * 传入 mapId 时按 id 查注册表，可在其子树外（如全局面板）驱动绘制。
 */
export function useMapboxDraw(options: UseMapboxDrawOptions = {}): MapboxDrawContext {
  if (options.mapId) return createRemoteContext(options.mapId)

  const context = inject(DrawKey, null)
  if (!context) {
    throw new Error('[movk-mapbox] useMapboxDraw() must be called inside a <MapboxDrawControl> component, or pass options.mapId.')
  }
  return context
}
