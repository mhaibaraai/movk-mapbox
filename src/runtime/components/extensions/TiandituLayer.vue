<script setup lang="ts">
import { computed } from 'vue'
import { tiandituAnnotationFor, tiandituRasterSource, type TiandituLayerType } from '../../utils/tianditu'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

const props = withDefaults(defineProps<{
  /** 天地图图层类型，默认 vec 矢量底图 */
  layer?: TiandituLayerType
  /** 天地图 token；缺省时回退运行时配置 */
  tk?: string
  /** 叠加对应注记图层（vec→cva / img→cia / ter→cta） */
  annotation?: boolean
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  layer: 'vec',
  annotation: false
})

// 与类型无关的稳定 id：切换类型走 source 原地 setTiles 更新，避免整层重建
const BASE_ID = 'tianditu-base'
const ANNOTATION_ID = 'tianditu-annotation'

const source = computed(() => tiandituRasterSource(props.layer, { tk: props.tk }))

const annoType = computed(() => (props.annotation ? tiandituAnnotationFor(props.layer) : undefined))
const annoSource = computed(() => (annoType.value ? tiandituRasterSource(annoType.value, { tk: props.tk }) : undefined))
</script>

<template>
  <MapboxSource :source-id="BASE_ID" :source="source">
    <MapboxLayer :layer-id="BASE_ID" type="raster" :source="BASE_ID" :before-id="beforeId" />
  </MapboxSource>
  <MapboxSource v-if="annoSource" :source-id="ANNOTATION_ID" :source="annoSource">
    <MapboxLayer :layer-id="ANNOTATION_ID" type="raster" :source="ANNOTATION_ID" :before-id="beforeId" />
  </MapboxSource>
</template>
