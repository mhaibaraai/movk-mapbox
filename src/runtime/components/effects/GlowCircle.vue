<script setup lang="ts">
import { computed, useId } from 'vue'
import type { GeoJSONSourceSpecification } from 'mapbox-gl'
import { useMapAnimation } from '../../composables/useMapAnimation'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

/** 炫光圆：实心内核 + 模糊光晕，可选呼吸脉冲。 */
const props = withDefaults(defineProps<{
  /** 点要素数据（GeoJSON 或其 URL） */
  data: GeoJSONSourceSpecification['data']
  /** 图层 id 前缀；省略时自动生成 */
  layerId?: string
  /**
   * 主色
   * @defaultValue '#f59e0b'
   */
  color?: string
  /**
   * 内核半径（像素）
   * @defaultValue 6
   */
  radius?: number
  /**
   * 光晕半径倍数
   * @defaultValue 3
   */
  glowScale?: number
  /**
   * 呼吸脉冲（光晕半径 ±25% 正弦摆动）
   * @defaultValue false
   */
  pulse?: boolean
  /**
   * 脉冲周期（毫秒）
   * @defaultValue 2000
   */
  duration?: number
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  color: '#f59e0b',
  radius: 6,
  glowScale: 3,
  pulse: false,
  duration: 2000
})

const id = props.layerId ?? `movk-glow-${useId()}`
const source = computed<GeoJSONSourceSpecification>(() => ({ type: 'geojson', data: props.data }))

const glowRadius = computed(() => props.radius * props.glowScale)
const glowPaint = computed(() => ({
  'circle-color': props.color,
  'circle-radius': glowRadius.value,
  'circle-blur': 1,
  'circle-opacity': 0.7
}))
const corePaint = computed(() => ({
  'circle-color': props.color,
  'circle-radius': props.radius
}))

// pulse 关闭时不启动帧循环，纯静态光晕零开销
useMapAnimation((map, elapsed) => {
  const layerId = `${id}-glow`
  if (!map.getLayer(layerId)) return
  const wave = Math.sin((elapsed / props.duration) * Math.PI * 2)
  map.setPaintProperty(layerId, 'circle-radius', glowRadius.value * (1 + wave * 0.25))
}, { immediate: props.pulse })
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer :layer-id="`${id}-glow`" type="circle" :source="id" :paint="glowPaint" :before-id="beforeId" />
    <MapboxLayer :layer-id="`${id}-core`" type="circle" :source="id" :paint="corePaint" :before-id="beforeId" />
  </MapboxSource>
</template>
