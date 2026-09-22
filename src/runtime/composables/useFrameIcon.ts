import { onUnmounted, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { Map as MaplibreMap, MapEventType, StyleImageInterface } from 'maplibre-gl'
import { useMap } from './useMap'
import { createFrameStyleImage } from '../utils/frame-icon'

export interface UseFrameIconOptions {
  /** 注册到样式的图片名(symbol 图层 icon-image 引用) */
  imageName: string
  /** 纹理边长(像素)；变化时重建 StyleImage */
  size: MaybeRefOrGetter<number>
  /** 当前帧序列(响应式取值) */
  frames: () => ImageData[]
  /** 固定帧率,durations 缺省时生效 */
  fps?: MaybeRefOrGetter<number | undefined>
  /** 每帧时长 ms(响应式取值),优先于 fps */
  durations?: () => number[] | undefined
}

/**
 * 帧动画图标生命周期:注册 StyleImageInterface、样式重载补回、styleimagemissing 兜底、卸载清理。
 * SpriteImage / AnimatedImage 共用,确保纹理建立与缺图兜底逻辑一致。
 */
export function useFrameIcon(options: UseFrameIconOptions): void {
  const ctx = useMap()
  const { imageName } = options

  function create(): StyleImageInterface {
    return createFrameStyleImage({
      size: toValue(options.size),
      frames: options.frames,
      fps: () => toValue(options.fps) ?? 12,
      durations: options.durations,
      getMap: () => ctx.map.value
    })
  }

  let image = create()

  function ensureImage(map: MaplibreMap): void {
    if (!map.isStyleLoaded() || map.hasImage(imageName)) return
    map.addImage(imageName, image)
  }

  // 兜底:边角时序(setStyle 重载竞态等)致图片名缺失时按需重新注册
  function onMissing(e: MapEventType['styleimagemissing']): void {
    const map = ctx.map.value
    if (e.id === imageName && map && !map.hasImage(imageName)) {
      map.addImage(imageName, image)
    }
  }

  // setStyle 清空样式图片后经 onReady 重新注册;styleimagemissing 监听去重防堆叠
  const stopReady = ctx.onReady((map) => {
    ensureImage(map)
    map.off('styleimagemissing', onMissing)
    map.on('styleimagemissing', onMissing)
  })

  // StyleImage 宽高在注册时固定：换尺寸需重建，同一 tick 内移除再注册，不会触发缺图
  watch(() => toValue(options.size), () => {
    image = create()
    const map = ctx.map.value
    if (!map?.hasImage(imageName)) return
    map.removeImage(imageName)
    map.addImage(imageName, image)
  })

  onUnmounted(() => {
    stopReady()
    const map = ctx.map.value
    if (!map) return
    map.off('styleimagemissing', onMissing)
    if (map.hasImage(imageName)) map.removeImage(imageName)
  })
}
