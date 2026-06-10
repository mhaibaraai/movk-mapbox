import { onMounted, onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'
import type { MapboxContext } from '../types'
import { useContextResolver } from '../domains/map/resolve'
import { logger } from '../utils/logger'

export interface UseMapboxImageOptions {
  /** 目标地图 id；在 MapboxMap 子树外使用时必填 */
  mapId?: string
  /** 作为 SDF 图标（可经 icon-color 着色） */
  sdf?: boolean
  /** 像素密度，默认 1 */
  pixelRatio?: number
}

/**
 * 注册 symbol 图层可用的命名图片。
 * setStyle 清空样式图片后经 onReady 自动补回；卸载时移除。
 */
export function useMapboxImage(
  name: string,
  url: string,
  options: UseMapboxImageOptions = {}
): { loaded: Ref<boolean> } {
  const { mapId, ...imageOptions } = options
  const resolve = useContextResolver(mapId)
  const loaded = ref(false)

  let ctx: MapboxContext | undefined
  let stopReady: (() => void) | undefined

  onMounted(() => {
    ctx = resolve()
    if (!ctx) {
      logger.warn('useMapboxImage: no map context found; pass options.mapId or call inside <MapboxMap>.')
      return
    }
    stopReady = ctx.onReady((map) => {
      if (map.hasImage(name)) {
        loaded.value = true
        return
      }
      map.loadImage(url, (error, image) => {
        if (error || !image) {
          logger.warn(`Failed to load image "${name}":`, error)
          return
        }
        if (!map.hasImage(name)) map.addImage(name, image, imageOptions)
        loaded.value = true
      })
    })
  })

  onUnmounted(() => {
    stopReady?.()
    const map = ctx?.map.value
    if (map?.hasImage(name)) map.removeImage(name)
  })

  return { loaded }
}
