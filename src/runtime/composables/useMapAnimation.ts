import { useRafFn } from '@vueuse/core'
import type { Ref } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import { useContextResolver } from '../domains/map/resolve'

export interface UseMapAnimationOptions {
  /** 目标地图 id；在 MapboxMap 子树外使用时必填 */
  mapId?: string
  /** 创建后立即启动，默认 true */
  immediate?: boolean
}

export interface UseMapAnimationReturn {
  pause: () => void
  resume: () => void
  isActive: Readonly<Ref<boolean>>
}

/**
 * 地图帧动画原语：基于 useRafFn（组件卸载自动停止），
 * 仅在地图存在且样式就绪时调用 frame，供动效组件与帧驱动图片复用。
 */
export function useMapAnimation(
  frame: (map: MapboxMap, elapsedMs: number) => void,
  options: UseMapAnimationOptions = {}
): UseMapAnimationReturn {
  const resolve = useContextResolver(options.mapId)
  let start: number | undefined

  const { pause, resume, isActive } = useRafFn(({ timestamp }) => {
    const map = resolve()?.map.value
    if (!map || !map.isStyleLoaded()) return
    start ??= timestamp
    frame(map, timestamp - start)
  }, { immediate: options.immediate ?? true })

  return { pause, resume, isActive }
}
