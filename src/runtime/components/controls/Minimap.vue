<script setup lang="ts">
import type { ControlPosition, StyleSpecification } from 'maplibre-gl'
import { useControl } from '../../domains/map/control'
import { createMinimapControl } from '../../domains/map/minimap'

const props = withDefaults(defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /** 鹰眼底图样式（对象或样式 URL）；省略时沿用主图样式并跟随其切换 */
  mapStyle?: StyleSpecification | string
  /**
   * 相对主图的缩放偏移
   * @defaultValue -4
   */
  zoomOffset?: number
  /**
   * 宽度（px）
   * @defaultValue 200
   */
  width?: number
  /**
   * 高度（px）
   * @defaultValue 150
   */
  height?: number
  /**
   * 视口框颜色
   * @defaultValue '#3b82f6'
   */
  color?: string
}>(), {
  zoomOffset: -4,
  width: 200,
  height: 150,
  color: '#3b82f6'
})

useControl(
  () => createMinimapControl({
    style: props.mapStyle,
    zoomOffset: props.zoomOffset,
    width: props.width,
    height: props.height,
    color: props.color
  }),
  () => props.position,
  () => [props.mapStyle, props.zoomOffset, props.width, props.height, props.color]
)
</script>

<template>
  <slot />
</template>

<style>
.movk-maplibre-minimap {
  overflow: hidden;
  cursor: pointer;
  touch-action: none;
}
</style>
