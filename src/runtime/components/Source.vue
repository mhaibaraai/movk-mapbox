<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import type { GeoJSONSource, ImageSource, RasterTileSource, SourceSpecification, VectorTileSource, VideoSource } from 'mapbox-gl'
import { useMap } from '../composables/useMap'

const props = defineProps<{
  /** source id */
  sourceId: string
  /**
   * 数据源定义
   * @see https://docs.mapbox.com/style-spec/reference/sources
   */
  source: SourceSpecification
}>()

const ctx = useMap()

const stopReady = ctx.onReady((map) => {
  if (!map.getSource(props.sourceId)) {
    map.addSource(props.sourceId, props.source)
  }
})

// 按类型增量更新已有 source，避免整源重建
watch(() => props.source, (next) => {
  const source = ctx.map.value?.getSource(props.sourceId)
  if (!source) return

  if (next.type === 'geojson' && next.data) {
    (source as GeoJSONSource).setData(next.data)
  } else if (next.type === 'vector') {
    if (next.url) (source as VectorTileSource).setUrl(next.url)
    if (next.tiles) (source as VectorTileSource).setTiles(next.tiles)
  } else if (next.type === 'raster' || next.type === 'raster-dem') {
    if (next.url) (source as RasterTileSource).setUrl(next.url)
    if (next.tiles) (source as RasterTileSource).setTiles(next.tiles)
  } else if (next.type === 'image' && next.url) {
    (source as ImageSource).updateImage(next as typeof next & { url: string })
  } else if (next.type === 'video' && next.coordinates) {
    (source as VideoSource).setCoordinates(next.coordinates)
  }
}, { deep: true })

onUnmounted(() => {
  stopReady()
  const map = ctx.map.value
  if (!map?.getSource(props.sourceId)) return
  // 仍有依赖该源的图层时 removeSource 会抛错，交由图层先行卸载；此处兜底吞掉
  try {
    map.removeSource(props.sourceId)
  } catch {
    // sources is still in use, layers will be torn down by their own unmount
  }
})
</script>

<template>
  <slot />
</template>
