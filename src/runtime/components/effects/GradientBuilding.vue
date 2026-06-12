<script setup lang="ts">
import { computed, useId } from 'vue'
import { buildingGradientPaint } from '../../utils/building-effects'
import MapboxBuildingLayer from '../layers/BuildingLayer.vue'

/** 渐变建筑：按高度插值着色的 3D 建筑。依赖 Mapbox 官方样式 composite/building。 */
const props = withDefaults(defineProps<{
  /** 图层 id；省略时自动生成 */
  layerId?: string
  /** 高度-颜色断点 */
  stops?: [number, string][]
  /**
   * 整体透明度
   * @defaultValue 0.85
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

const id = props.layerId ?? `movk-gradient-building-${useId()}`
const paint = computed(() => buildingGradientPaint({
  stops: props.stops,
  opacity: props.opacity,
  minzoom: props.minzoom
}))
</script>

<template>
  <MapboxBuildingLayer :layer-id="id" :minzoom="minzoom" :paint="paint" :before-id="beforeId" />
</template>
