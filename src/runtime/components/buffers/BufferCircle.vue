<script setup lang="ts">
import { computed, useId } from 'vue'
import { circle } from '@turf/circle'
import type { GeoJSONSourceSpecification } from 'mapbox-gl'
import { bufferPaints } from '../../utils/buffer'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

/** 圆形缓冲区：turf 测地圆，半径单位米。 */
const props = withDefaults(defineProps<{
  /** 圆心经纬度 */
  center: [number, number]
  /** 半径（米） */
  radius: number
  /**
   * 圆周采样段数
   * @defaultValue 64
   */
  steps?: number
  /** 图层 id 前缀；省略时自动生成 */
  layerId?: string
  /** 主色（快捷样式） */
  color?: string
  /** 整体覆盖填充 paint */
  fillPaint?: Record<string, unknown>
  /** 整体覆盖描边 paint */
  linePaint?: Record<string, unknown>
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  steps: 64
})

const id = props.layerId ?? `movk-buffer-circle-${useId()}`

const source = computed<GeoJSONSourceSpecification>(() => ({
  type: 'geojson',
  data: circle(props.center, props.radius, { steps: props.steps, units: 'meters' })
}))

const paints = computed(() => bufferPaints({ color: props.color }))
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer :layer-id="`${id}-fill`" type="fill" :source="id" :paint="fillPaint ?? paints.fill" :before-id="beforeId" />
    <MapboxLayer :layer-id="`${id}-line`" type="line" :source="id" :paint="linePaint ?? paints.line" :before-id="beforeId" />
  </MapboxSource>
</template>
