<script setup lang="ts">
import { computed } from 'vue'
import { wmsRasterSource } from '../../utils/wms'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

const props = withDefaults(defineProps<{
  /** WMS 服务基础地址 */
  url: string
  /** 图层 LAYERS（逗号分隔多层） */
  layers: string
  /**
   * source/layer id
   * @defaultValue `wms-${layers}`
   */
  layerId?: string
  /**
   * WMS 版本
   * @defaultValue '1.1.1'
   */
  version?: string
  /**
   * 图片格式
   * @defaultValue 'image/png'
   */
  format?: string
  /**
   * 是否透明
   * @defaultValue true
   */
  transparent?: boolean
  /**
   * 样式
   * @defaultValue ''
   */
  styles?: string
  /**
   * 坐标参考系
   * @defaultValue 'EPSG:3857'
   */
  crs?: string
  /**
   * 瓦片尺寸
   * @defaultValue 256
   */
  tileSize?: number
  /** 版权信息 */
  attribution?: string
  /** 透传查询参数 */
  params?: Record<string, string | undefined>
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {})

const id = computed(() => props.layerId ?? `wms-${props.layers}`)
const source = computed(() => wmsRasterSource({
  url: props.url,
  layers: props.layers,
  version: props.version,
  format: props.format,
  transparent: props.transparent,
  styles: props.styles,
  crs: props.crs,
  tileSize: props.tileSize,
  attribution: props.attribution,
  params: props.params
}))
</script>

<template>
  <MapboxSource :key="id" :source-id="id" :source="source">
    <MapboxLayer :layer-id="id" type="raster" :source="id" :before-id="beforeId" />
  </MapboxSource>
</template>
