<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import type { Map as MapboxMap, RasterDEMSourceSpecification } from 'mapbox-gl'
import { useMap } from '../../composables/useMap'

const props = withDefaults(defineProps<{
  /**
   * 地形夸张系数
   * @defaultValue 1
   */
  exaggeration?: number
  /**
   * DEM 数据源，缺省用 Mapbox 官方 terrain-dem-v1
   * @see https://docs.mapbox.com/style-spec/reference/sources/#raster-dem
   */
  source?: RasterDEMSourceSpecification
  /**
   * DEM source id
   * @defaultValue 'movk-terrain-dem'
   */
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
  // 样式加载窗口期 setter/removeSource 必抛，吞掉交由新样式重置；源仍被引用同理
  try {
    map.setTerrain(null)
  } catch {
    // style is not done loading
  }
  if (map.getSource(props.sourceId)) {
    try {
      map.removeSource(props.sourceId)
    } catch {
      // source is still in use
    }
  }
})
</script>

<template>
  <slot />
</template>
