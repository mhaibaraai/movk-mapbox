<script setup lang="ts">
import { onUnmounted } from 'vue'
import type { CustomLayerInterface } from 'mapbox-gl'
import { useMap } from '../composables/useMap'

/** CustomLayerInterface 逃生舱：托管自定义 WebGL 图层的挂载/卸载与样式重载重建。 */
const props = defineProps<{
  /**
   * 自定义图层实现（含 id/type/render）
   * @see https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface
   */
  layer: CustomLayerInterface
  /** 插入到该图层之前 */
  beforeId?: string
}>()

const ctx = useMap()

const stopReady = ctx.onReady((map) => {
  if (map.getLayer(props.layer.id)) return
  const before = props.beforeId && map.getLayer(props.beforeId) ? props.beforeId : undefined
  map.addLayer(props.layer, before)
})

onUnmounted(() => {
  stopReady()
  const map = ctx.map.value
  if (map?.getLayer(props.layer.id)) map.removeLayer(props.layer.id)
})
</script>

<template>
  <slot />
</template>
