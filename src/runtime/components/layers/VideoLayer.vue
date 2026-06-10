<script setup lang="ts">
import { computed, useId } from 'vue'
import type { VideoSource, VideoSourceSpecification } from 'mapbox-gl'
import { useMap } from '../../composables/useMap'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

const props = withDefaults(defineProps<{
  /** 图层 id；省略时自动生成 */
  layerId?: string
  /** 视频地址列表（多格式回退） */
  urls: string[]
  /** 四角经纬度：左上/右上/右下/左下 */
  coordinates: VideoSourceSpecification['coordinates']
  /** 不透明度，默认 1 */
  opacity?: number
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  opacity: 1
})

const ctx = useMap()
const id = props.layerId ?? `movk-video-${useId()}`

const source = computed<VideoSourceSpecification>(() => ({
  type: 'video',
  urls: props.urls,
  coordinates: props.coordinates
}))
const paint = computed(() => ({ 'raster-opacity': props.opacity }))

function videoSource(): VideoSource | undefined {
  return ctx.map.value?.getSource(id) as VideoSource | undefined
}

defineExpose({
  /** 播放视频 */
  play: () => videoSource()?.play(),
  /** 暂停视频 */
  pause: () => videoSource()?.pause(),
  /** 底层 video 元素 */
  video: () => videoSource()?.getVideo()
})
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer :layer-id="id" type="raster" :source="id" :paint="paint" :before-id="beforeId" />
  </MapboxSource>
</template>
