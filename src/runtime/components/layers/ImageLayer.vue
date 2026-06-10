<script setup lang="ts">
import { computed, useId } from 'vue'
import type { ImageSourceSpecification } from 'mapbox-gl'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

const props = withDefaults(defineProps<{
  /** 图层 id；省略时自动生成 */
  layerId?: string
  /** 图片地址 */
  url: string
  /** 四角经纬度：左上/右上/右下/左下 */
  coordinates: ImageSourceSpecification['coordinates']
  /** 不透明度，默认 1 */
  opacity?: number
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  opacity: 1
})

const id = props.layerId ?? `movk-image-${useId()}`

const source = computed<ImageSourceSpecification>(() => ({
  type: 'image',
  url: props.url,
  coordinates: props.coordinates
}))
const paint = computed(() => ({ 'raster-opacity': props.opacity }))
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer :layer-id="id" type="raster" :source="id" :paint="paint" :before-id="beforeId" />
  </MapboxSource>
</template>
