<script setup lang="ts">
import { computed, useId } from 'vue'
import type { GeoJSONSourceSpecification } from 'mapbox-gl'
import { ringFade, ringProgress } from '../../utils/effects'
import { useMapAnimation } from '../../composables/useMapAnimation'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

/** 扩散圆：多圈同心圆周期性扩张并渐隐。 */
const props = withDefaults(defineProps<{
  /** 点要素数据（GeoJSON 或其 URL） */
  data: GeoJSONSourceSpecification['data']
  /** 图层 id 前缀；省略时自动生成 */
  layerId?: string
  /**
   * 主色
   * @defaultValue '#3b82f6'
   */
  color?: string
  /**
   * 最大扩散半径（像素）
   * @defaultValue 40
   */
  maxRadius?: number
  /**
   * 单圈扩散周期（毫秒）
   * @defaultValue 2400
   */
  duration?: number
  /**
   * 同时扩散的圈数
   * @defaultValue 3
   */
  rings?: number
  /**
   * 峰值不透明度
   * @defaultValue 0.6
   */
  opacity?: number
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  color: '#3b82f6',
  maxRadius: 40,
  duration: 2400,
  rings: 3,
  opacity: 0.6
})

const id = props.layerId ?? `movk-diffusion-${useId()}`
const source = computed<GeoJSONSourceSpecification>(() => ({ type: 'geojson', data: props.data }))

const initialPaint = computed(() => ({
  'circle-color': props.color,
  'circle-radius': 0,
  'circle-opacity': 0
}))

useMapAnimation((map, elapsed) => {
  for (let ring = 0; ring < props.rings; ring++) {
    const layerId = `${id}-ring-${ring}`
    if (!map.getLayer(layerId)) continue
    const progress = ringProgress(ring, props.rings, elapsed, props.duration)
    map.setPaintProperty(layerId, 'circle-radius', progress * props.maxRadius)
    map.setPaintProperty(layerId, 'circle-opacity', ringFade(progress) * props.opacity)
  }
})
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer
      v-for="ring in rings"
      :key="ring"
      :layer-id="`${id}-ring-${ring - 1}`"
      type="circle"
      :source="id"
      :paint="initialPaint"
      :before-id="beforeId"
    />
  </MapboxSource>
</template>
