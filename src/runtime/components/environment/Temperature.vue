<script setup lang="ts">
import { computed, useId } from 'vue'
import type { GeoJSONSourceSpecification } from 'mapbox-gl'
import { heatmapPaint } from '../../utils/heatmap'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

/** 温度热力层:GeoJSON 点按温度属性渲染 mapbox 原生 heatmap。 */
const props = withDefaults(defineProps<{
  /** 点要素数据(GeoJSON 或其 URL) */
  data: GeoJSONSourceSpecification['data']
  /** 图层 id;省略时自动生成 */
  layerId?: string
  /** 权重取值的要素属性,默认 temperature */
  weightProperty?: string
  /** 温度取值范围 [min,max],线性映射到热力权重,默认 [0,40] */
  weightRange?: [number, number]
  /** 密度-颜色断点,默认蓝→红五档 */
  colorStops?: [number, string][]
  /** 热力半径(像素),默认 30 */
  radius?: number
  /** 热力强度,默认 1 */
  intensity?: number
  /** 不透明度,默认 1 */
  opacity?: number
  /** 超过该缩放级别隐藏热力(通常切到点图);省略不限制 */
  maxzoom?: number
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  weightProperty: 'temperature',
  radius: 30,
  intensity: 1,
  opacity: 1
})

const id = props.layerId ?? `movk-temperature-${useId()}`

const source = computed<GeoJSONSourceSpecification>(() => ({ type: 'geojson', data: props.data }))

const paint = computed(() => heatmapPaint({
  weightProperty: props.weightProperty,
  weightRange: props.weightRange,
  colorStops: props.colorStops,
  radius: props.radius,
  intensity: props.intensity,
  opacity: props.opacity
}))
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer
      :layer-id="id"
      type="heatmap"
      :source="id"
      :paint="paint"
      :maxzoom="maxzoom"
      :before-id="beforeId"
    />
  </MapboxSource>
</template>
