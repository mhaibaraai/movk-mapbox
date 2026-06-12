import { onUnmounted } from 'vue'
import type { Map as MapboxMap, MapEventOf } from 'mapbox-gl'
import { useMap } from './useMap'
import { createFrameStyleImage } from '../utils/frame-icon'

export interface UseFrameIconOptions {
  /** 注册到样式的图片名(symbol 图层 icon-image 引用) */
  imageName: string
  /** 纹理边长(像素) */
  size: number
  /** 当前帧序列(响应式取值) */
  frames: () => ImageData[]
  /** 固定帧率,durations 缺省时生效 */
  fps?: number
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

  const image = createFrameStyleImage({
    size: options.size,
    frames: options.frames,
    fps: options.fps,
    durations: options.durations,
    getMap: () => ctx.map.value
  })

  function ensureImage(map: MapboxMap): void {
    if (!map.isStyleLoaded() || map.hasImage(imageName)) return
    map.addImage(imageName, image)
  }

  // 兜底:边角时序(setStyle 重载竞态等)致图片名缺失时按需重新注册
  function onMissing(e: MapEventOf<'styleimagemissing'>): void {
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

  onUnmounted(() => {
    stopReady()
    const map = ctx.map.value
    if (!map) return
    map.off('styleimagemissing', onMissing)
    if (map.hasImage(imageName)) map.removeImage(imageName)
  })
}
