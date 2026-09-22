<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import lottie from 'lottie-web'
import type { AnimationItem } from 'lottie-web'
import type { LngLatLike } from 'maplibre-gl'
import MaplibreMarker from './Marker.vue'

/** Lottie 标记：在地图标记位用 lottie-web 渲染矢量动画（走 Marker DOM，非 icon 帧驱动）。 */
const props = withDefaults(defineProps<{
  /** lottie 动画数据（JSON 对象）；与 path 二选一，按引用比较，替换对象才重新加载 */
  animationData?: object
  /** lottie 动画 URL；与 animationData 二选一 */
  path?: string
  /**
   * 是否循环
   * @defaultValue true
   */
  loop?: boolean
  /**
   * 是否自动播放
   * @defaultValue true
   */
  autoplay?: boolean
  /**
   * 播放速度倍率
   * @defaultValue 1
   */
  speed?: number
  /**
   * 容器宽（像素）
   * @defaultValue 64
   */
  width?: number
  /**
   * 容器高（像素）
   * @defaultValue 64
   */
  height?: number
}>(), {
  loop: true,
  autoplay: true,
  speed: 1,
  width: 64,
  height: 64
})

const lnglat = defineModel<LngLatLike>('lnglat', { required: true })
const container = useTemplateRef<HTMLDivElement>('container')
let anim: AnimationItem | undefined

function load(): void {
  anim?.destroy()
  anim = undefined
  if (!container.value) return
  const base = { container: container.value, renderer: 'svg' as const, loop: props.loop, autoplay: props.autoplay }
  anim = props.path
    ? lottie.loadAnimation({ ...base, path: props.path })
    : lottie.loadAnimation({ ...base, animationData: props.animationData })
  anim.setSpeed(props.speed)
}

onMounted(load)

// animationData 按引用比较：体积可能很大，且 lottie-web 会原地修改传入对象，深比较既贵又不可靠
watch([() => props.path, () => props.animationData, () => props.loop, () => props.autoplay], load)
watch(() => props.speed, speed => anim?.setSpeed(speed))

onUnmounted(() => anim?.destroy())
</script>

<template>
  <MaplibreMarker v-model:lnglat="lnglat">
    <div ref="container" :style="{ width: `${width}px`, height: `${height}px` }" />
  </MaplibreMarker>
</template>
