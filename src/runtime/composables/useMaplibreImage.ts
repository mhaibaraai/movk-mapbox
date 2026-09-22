import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'
import type { MaplibreContext } from '../types'
import { useContextResolver } from '../domains/map/resolve'
import { logger } from '../utils/logger'

export interface UseMaplibreImageOptions {
  /** 目标地图 id；在 MaplibreMap 子树外使用时必填 */
  mapId?: string
  /** 作为 SDF 图标（可经 icon-color 着色） */
  sdf?: boolean
  /**
   * 像素密度
   * @defaultValue 1
   */
  pixelRatio?: number
}

/**
 * 注册 symbol 图层可用的命名图片。
 * setStyle 清空样式图片后经 onReady 自动补回；卸载时移除。
 */
export function useMaplibreImage(
  name: string,
  url: string,
  options: UseMaplibreImageOptions = {}
): { loaded: Ref<boolean> } {
  const { mapId, ...imageOptions } = options
  const resolve = useContextResolver(mapId)
  const loaded = ref(false)

  let ctx: MaplibreContext | undefined
  let stopReady: (() => void) | undefined

  onMounted(() => {
    ctx = resolve()
    if (!ctx) {
      logger.warn('useMaplibreImage: no map context found; pass options.mapId or call inside <MaplibreMap>.')
      return
    }
    stopReady = ctx.onReady((map) => {
      if (map.hasImage(name)) {
        loaded.value = true
        return
      }
      map.loadImage(url)
        .then(({ data }) => {
          if (!map.hasImage(name)) map.addImage(name, data, imageOptions)
          loaded.value = true
        })
        .catch(error => logger.warn(`Failed to load image "${name}":`, error))
    })
  })

  onUnmounted(() => {
    stopReady?.()
    const map = ctx?.map.value
    if (map?.hasImage(name)) map.removeImage(name)
  })

  return { loaded }
}
