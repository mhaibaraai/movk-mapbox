import { useRafFn } from '@vueuse/core'
import type { Ref } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { useContextResolver } from '../domains/map/resolve'

export interface UseMapAnimationOptions {
  /** 目标地图 id；在 MaplibreMap 子树外使用时必填 */
  mapId?: string
  /**
   * 创建后立即启动
   * @defaultValue true
   */
  immediate?: boolean
}

export interface UseMapAnimationReturn {
  pause: () => void
  resume: () => void
  isActive: Readonly<Ref<boolean>>
}

/**
 * 地图帧动画原语：基于 useRafFn（组件卸载自动停止），
 * 仅在首次 load 之后且样式已解析时调用 frame，供动效组件与帧驱动图片复用。
 * 首次 load 前逐帧改样式会使 style 持续 dirty，推迟 load 及所有 whenLoaded 调用方；
 * 之后不用 isStyleLoaded：它要求瓦片与源全部加载完毕，拖动/缩放或每帧 setData 时会整段跳帧。
 */
export function useMapAnimation(
  frame: (map: MaplibreMap, elapsedMs: number, deltaMs: number) => void,
  options: UseMapAnimationOptions = {}
): UseMapAnimationReturn {
  const resolve = useContextResolver(options.mapId)
  let start: number | undefined

  const { pause, resume, isActive } = useRafFn(({ timestamp, delta }) => {
    const context = resolve()
    const map = context?.map.value
    if (!map || !context.isLoaded.value || !context.isStyleReady.value) return
    start ??= timestamp
    frame(map, timestamp - start, delta)
  }, { immediate: options.immediate ?? true })

  return { pause, resume, isActive }
}
