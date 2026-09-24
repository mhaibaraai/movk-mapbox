import { toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'
import type { MaplibreContext } from '../types'
import { getMapContext } from '../domains/map/registry'

export interface UseMapSyncOptions {
  /**
   * 是否启用联动；置 false 解绑，恢复时以首图相机重新对齐
   * @defaultValue true
   */
  enabled?: MaybeRefOrGetter<boolean>
}

/** 地图引用：map id（经注册表解析，需 MaplibreMap 设置 map-id）或地图上下文 */
export type MapSyncTarget = string | MaplibreContext

function resolveInstance(target: MapSyncTarget): MaplibreMap | undefined {
  const context = typeof target === 'string' ? getMapContext(target) : target
  return context?.map.value
}

function copyCamera(from: MaplibreMap, to: MaplibreMap): void {
  to.jumpTo({
    center: from.getCenter(),
    zoom: from.getZoom(),
    bearing: from.getBearing(),
    pitch: from.getPitch()
  })
}

/**
 * 多地图相机联动：任一地图移动时把 center/zoom/bearing/pitch 同步到其余地图。
 * 全部地图实例就绪后生效，绑定时以首图相机对齐其余地图；随调用方作用域销毁自动解绑。
 */
export function useMapSync(maps: MaybeRefOrGetter<MapSyncTarget[]>, options: UseMapSyncOptions = {}): void {
  watch(
    () => {
      if (toValue(options.enabled) === false) return []
      const instances = toValue(maps).map(resolveInstance)
      return instances.every(Boolean) ? instances as MaplibreMap[] : []
    },
    (instances, _, onCleanup) => {
      if (instances.length < 2) return
      // jumpTo 同步派发 move：以标志位吞掉被动地图的回声，避免反向同步
      let syncing = false
      const listeners = instances.map((source) => {
        const listener = (): void => {
          if (syncing) return
          syncing = true
          for (const target of instances) {
            if (target !== source) copyCamera(source, target)
          }
          syncing = false
        }
        source.on('move', listener)
        return listener
      })
      listeners[0]!()
      onCleanup(() => instances.forEach((map, i) => map.off('move', listeners[i]!)))
    },
    { immediate: true }
  )
}
