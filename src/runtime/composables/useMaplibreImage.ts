import { onMounted, onUnmounted, ref, toValue, watch } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'
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
 * setStyle 清空样式图片后经 onReady 自动补回；url 变化时加载新图并替换同名图片；卸载时移除。
 */
export function useMaplibreImage(
  name: string,
  url: MaybeRefOrGetter<string>,
  options: UseMaplibreImageOptions = {}
): { loaded: Ref<boolean> } {
  const { mapId, ...imageOptions } = options
  const resolve = useContextResolver(mapId)
  const loaded = ref(false)

  let ctx: MaplibreContext | undefined
  let stopReady: (() => void) | undefined
  // 竞态保护：只采纳最近一次加载的结果
  let loadToken = 0

  // replace 为 true 时替换已注册的同名图片；失败保留旧图，loaded 不回退，避免依赖方拆掉图层
  function load(map: MaplibreMap, replace: boolean): void {
    const token = ++loadToken
    const src = toValue(url)
    map.loadImage(src)
      .then(({ data }) => {
        if (token !== loadToken) return
        if (map.hasImage(name)) {
          if (!replace) {
            loaded.value = true
            return
          }
          // 同一 tick 内移除再注册，不会触发 styleimagemissing
          map.removeImage(name)
        }
        map.addImage(name, data, imageOptions)
        loaded.value = true
      })
      .catch((error) => {
        if (token === loadToken) logger.warn(`Failed to load image "${name}" from "${src}":`, error)
      })
  }

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
      load(map, false)
    })
  })

  watch(() => toValue(url), () => {
    const map = ctx?.map.value
    // 样式未就绪时交由 onReady 按最新 url 加载
    if (map?.isStyleLoaded()) load(map, true)
  })

  onUnmounted(() => {
    loadToken++
    stopReady?.()
    const map = ctx?.map.value
    if (map?.hasImage(name)) map.removeImage(name)
  })

  return { loaded }
}
