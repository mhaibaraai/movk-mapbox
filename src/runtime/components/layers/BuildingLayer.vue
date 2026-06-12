<script setup lang="ts">
import { computed, useId } from 'vue'
import { buildingLayerSpec } from '../../utils/building'
import MapboxLayer from '../Layer.vue'

// 依赖 Mapbox 官方样式的 composite/building 矢量源；天地图等空样式下无效
const props = defineProps<{
  /** 图层 id；省略时自动生成 */
  layerId?: string
  /**
   * 矢量数据源 id
   * @defaultValue 'composite'
   */
  source?: string
  /**
   * 数据源图层名
   * @defaultValue 'building'
   */
  sourceLayer?: string
  /**
   * 建筑颜色
   * @defaultValue '#aaa'
   */
  color?: string
  /**
   * 整体透明度
   * @defaultValue 0.8
   */
  opacity?: number
  /**
   * 显示建筑的最小缩放级别
   * @defaultValue 15
   */
  minzoom?: number
  /** 整体覆盖 paint（提供时忽略 color/opacity 预设） */
  paint?: Record<string, unknown>
  /** 插入到该图层之前 */
  beforeId?: string
}>()

const id = props.layerId ?? `movk-building-${useId()}`

const spec = computed(() => buildingLayerSpec({
  id,
  source: props.source,
  sourceLayer: props.sourceLayer,
  color: props.color,
  opacity: props.opacity,
  minzoom: props.minzoom,
  paint: props.paint
}))
</script>

<template>
  <MapboxLayer
    :layer-id="id"
    type="fill-extrusion"
    :source="spec.source"
    :source-layer="spec['source-layer']"
    :filter="spec.filter"
    :minzoom="spec.minzoom"
    :paint="spec.paint"
    :before-id="beforeId"
  />
</template>
