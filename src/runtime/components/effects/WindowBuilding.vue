<script setup lang="ts">
import { computed, onUnmounted, useId } from 'vue'
import { windowTextureImage } from '../../utils/building-effects'
import { useMap } from '../../composables/useMap'
import MapboxBuildingLayer from '../layers/BuildingLayer.vue'

/** 窗户建筑:程序生成窗户点阵贴图 fill-extrusion-pattern。依赖 Mapbox composite/building。 */
const props = withDefaults(defineProps<{
  /** 图层 id;省略时自动生成 */
  layerId?: string
  /** 窗户行数,默认 8 */
  rows?: number
  /** 窗户列数,默认 6 */
  cols?: number
  /** 亮窗颜色,默认 #fde68a */
  litColor?: string
  /** 暗窗/墙体颜色,默认 #1f2937 */
  darkColor?: string
  /** 亮窗比例,默认 0.45 */
  litRatio?: number
  /** 随机种子,默认 1 */
  seed?: number
  /** 整体透明度,默认 1 */
  opacity?: number
  /** 最小缩放级别,默认 15 */
  minzoom?: number
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  minzoom: 15
})

const ctx = useMap()
const id = props.layerId ?? `movk-window-building-${useId()}`
const imageName = `${id}-pattern`

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

// setStyle 清空样式图片后经 onReady 自动补回(同 Radar 模式)
const stopReady = ctx.onReady((map) => {
  if (map.hasImage(imageName)) return
  const image = windowTextureImage({
    rows: props.rows,
    cols: props.cols,
    litColor: props.litColor,
    darkColor: props.darkColor,
    litRatio: props.litRatio,
    seed: props.seed
  })
  if (image) map.addImage(imageName, image)
})

onUnmounted(() => {
  stopReady()
  const map = ctx.map.value
  if (map?.hasImage(imageName)) map.removeImage(imageName)
})
</script>

<template>
  <MapboxBuildingLayer :layer-id="id" :minzoom="minzoom" :paint="paint" :before-id="beforeId" />
</template>
