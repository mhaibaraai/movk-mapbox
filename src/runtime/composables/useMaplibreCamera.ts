import type { CameraOptions, EaseToOptions, FitBoundsOptions, FlyToOptions, LngLatBoundsLike, Map as MaplibreMap } from 'maplibre-gl'
import type { GeoJSON } from 'geojson'
import { useContextResolver } from '../domains/map/resolve'
import { boundsOfGeoJSON } from '../utils/geometry'
import { logger } from '../utils/logger'

export interface UseMaplibreCameraOptions {
  /** 目标地图 id；在 MaplibreMap 子树外使用时必填 */
  mapId?: string
}

export interface UseMaplibreCameraReturn {
  flyTo: (options: FlyToOptions) => Promise<void>
  easeTo: (options: EaseToOptions) => Promise<void>
  jumpTo: (options: CameraOptions) => Promise<void>
  /** 缩放到目标范围；target 支持包围盒或任意 GeoJSON（自动求包围盒） */
  fitBounds: (target: LngLatBoundsLike | GeoJSON, options?: FitBoundsOptions) => Promise<void>
}

// LngLatBoundsLike 为数组或 LngLatBounds 实例，均无字符串 type 字段
function isGeoJSON(target: LngLatBoundsLike | GeoJSON): target is GeoJSON {
  return !Array.isArray(target) && typeof target === 'object' && target !== null
    && typeof (target as { type?: unknown }).type === 'string'
}

/** 相机操作助手；所有方法等待地图实例创建后执行。 */
export function useMaplibreCamera(options: UseMaplibreCameraOptions = {}): UseMaplibreCameraReturn {
  const resolve = useContextResolver(options.mapId)

  async function withMap(action: (map: MaplibreMap) => void): Promise<void> {
    const ctx = resolve()
    if (!ctx) {
      logger.warn('useMaplibreCamera: no map context found; pass options.mapId or call inside <MaplibreMap>.')
      return
    }
    action(await ctx.whenAttached())
  }

  return {
    flyTo: options => withMap(map => map.flyTo(options)),
    easeTo: options => withMap(map => map.easeTo(options)),
    jumpTo: options => withMap(map => map.jumpTo(options)),
    fitBounds(target, fitOptions) {
      return withMap((map) => {
        const bounds = isGeoJSON(target) ? boundsOfGeoJSON(target) : target
        if (!bounds) {
          logger.warn('fitBounds: target GeoJSON has no coordinates.')
          return
        }
        map.fitBounds(bounds, fitOptions)
      })
    }
  }
}
