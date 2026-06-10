<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import type { Map as MapboxMap, RasterDEMSourceSpecification } from 'mapbox-gl'
import { useMap } from '../../composables/useMap'

const props = withDefaults(defineProps<{
  /** 地形夸张系数，默认 1 */
  exaggeration?: number
  /** DEM 数据源，缺省用 Mapbox 官方 terrain-dem-v1 */
  source?: RasterDEMSourceSpecification
  /** DEM source id，默认 movk-terrain-dem */
  sourceId?: string
}>(), {
  exaggeration: 1,
  sourceId: 'movk-terrain-dem'
})

const DEFAULT_DEM: RasterDEMSourceSpecification = {
  type: 'raster-dem',
  url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
  tileSize: 512,
  maxzoom: 14
}

const ctx = useMap()

// 源与地形在同一回调内顺序建立，规避 onReady 注册顺序导致的 source 未就绪
function apply(map: MapboxMap): void {
  if (!map.getSource(props.sourceId)) {
    map.addSource(props.sourceId, props.source ?? DEFAULT_DEM)
  }
  map.setTerrain({ source: props.sourceId, exaggeration: props.exaggeration })
}

const stopReady = ctx.onReady(apply)

watch(() => props.exaggeration, (value) => {
  const map = ctx.map.value
  if (map?.getSource(props.sourceId)) {
    map.setTerrain({ source: props.sourceId, exaggeration: value })
  }
})

onUnmounted(() => {
  stopReady()
  const map = ctx.map.value
  if (!map) return
  map.setTerrain(null)
  if (map.getSource(props.sourceId)) {
    try {
      map.removeSource(props.sourceId)
    } catch {
      // 仍被引用时交由样式重载清理
    }
  }
})
</script>

<template>
  <slot />
</template>
