<script setup lang="ts">
import { computed, useId } from 'vue'
import { omitUndefined } from '@movk/core'
import type { RasterSourceSpecification } from 'mapbox-gl'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

const props = withDefaults(defineProps<{
  /** 图层 id；省略时自动生成 */
  layerId?: string
  /** URL 模板瓦片地址（{z}/{x}/{y} 占位） */
  tiles: string[]
  /**
   * 瓦片尺寸
   * @defaultValue 256
   */
  tileSize?: number
  /**
   * 瓦片坐标方案
   * @defaultValue 'xyz'
   */
  scheme?: 'xyz' | 'tms'
  /** 数据源最小缩放级别 */
  minzoom?: number
  /** 数据源最大缩放级别 */
  maxzoom?: number
  /** 版权信息 */
  attribution?: string
  /**
   * 不透明度
   * @defaultValue 1
   */
  opacity?: number
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  tileSize: 256,
  opacity: 1
})

const id = props.layerId ?? `movk-raster-${useId()}`

const source = computed<RasterSourceSpecification>(() => omitUndefined({
  type: 'raster' as const,
  tiles: props.tiles,
  tileSize: props.tileSize,
  scheme: props.scheme,
  minzoom: props.minzoom,
  maxzoom: props.maxzoom,
  attribution: props.attribution
}) as RasterSourceSpecification)
const paint = computed(() => ({ 'raster-opacity': props.opacity }))
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer :layer-id="id" type="raster" :source="id" :paint="paint" :before-id="beforeId" />
  </MapboxSource>
</template>
