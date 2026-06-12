<script setup lang="ts">
import { computed, onMounted, ref, useId, watch } from 'vue'
import type { GeoJSONSourceSpecification } from 'mapbox-gl'
import { decodeAnimatedImage } from '../../utils/animated-image'
import { useMap } from '../../composables/useMap'
import { useFrameIcon } from '../../composables/useFrameIcon'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

/** 动图图标层：ImageDecoder 解码 GIF/APNG/WebP 为帧，按各帧时长驱动 symbol 循环播放，零解码依赖。 */
const props = withDefaults(defineProps<{
  /** 点要素数据（GeoJSON 或其 URL） */
  data: GeoJSONSourceSpecification['data']
  /** 动图 URL（GIF/APNG/WebP/AVIF） */
  image: string
  /**
   * 图标边长（像素），帧统一缩放到 size×size
   * @defaultValue 64
   */
  size?: number
  /**
   * 解码无原生帧时长时的回退帧率
   * @defaultValue 12
   */
  fps?: number
  /** 图层 id；省略时自动生成 */
  layerId?: string
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  size: 64,
  fps: 12
})

const ctx = useMap()
const id = props.layerId ?? `movk-animated-${useId()}`
const imageName = `${id}-frames`

const source = computed<GeoJSONSourceSpecification>(() => ({ type: 'geojson', data: props.data }))

const layout = computed(() => ({
  'icon-image': imageName,
  'icon-allow-overlap': true,
  'icon-ignore-placement': true
}))

// 解码后的逐帧 ImageData 与每帧时长;无 ImageDecoder 环境保持空,render 自然跳过
const frames = ref<ImageData[]>([])
const durations = ref<number[]>([])

useFrameIcon({
  imageName,
  size: props.size,
  frames: () => frames.value,
  fps: props.fps,
  durations: () => durations.value
})

async function load(url: string): Promise<void> {
  frames.value = []
  durations.value = []
  const decoded = await decodeAnimatedImage(url, props.size)
  frames.value = decoded.frames
  durations.value = decoded.durations
  // 解码晚于 onReady,就绪后触发一次以启动渲染循环
  ctx.map.value?.triggerRepaint()
}

onMounted(() => load(props.image))
watch(() => props.image, url => load(url))
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer :layer-id="id" type="symbol" :source="id" :layout="layout" :before-id="beforeId" />
  </MapboxSource>
</template>
