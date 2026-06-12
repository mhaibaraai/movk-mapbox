<script setup lang="ts">
import { computed, useId } from 'vue'
import { useMapboxImage } from '../../composables/useMapboxImage'
import MapboxBuildingLayer from '../layers/BuildingLayer.vue'

/** 纹理建筑：用户贴图 url 作 fill-extrusion-pattern。依赖 Mapbox composite/building。 */
const props = withDefaults(defineProps<{
  /** 贴图地址 */
  url: string
  /** 图层 id；省略时自动生成 */
  layerId?: string
  /**
   * 整体透明度
   * @defaultValue 1
   */
  opacity?: number
  /**
   * 最小缩放级别
   * @defaultValue 15
   */
  minzoom?: number
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  minzoom: 15
})

const id = props.layerId ?? `movk-texture-building-${useId()}`
const imageName = `${id}-texture`

// 复用 useMapboxImage:加载贴图并在 setStyle 后自动补回
const { loaded } = useMapboxImage(imageName, props.url)

const paint = computed(() => ({
  'fill-extrusion-pattern': imageName,
  'fill-extrusion-height': [
    'interpolate', ['linear'], ['zoom'],
    props.minzoom, 0,
    props.minzoom + 0.05, ['get', 'height']
  ],
  'fill-extrusion-base': [
    'interpolate', ['linear'], ['zoom'],
    props.minzoom, 0,
    props.minzoom + 0.05, ['get', 'min_height']
  ],
  'fill-extrusion-opacity': props.opacity ?? 1
}))
</script>

<template>
  <MapboxBuildingLayer v-if="loaded" :layer-id="id" :minzoom="minzoom" :paint="paint" :before-id="beforeId" />
</template>
