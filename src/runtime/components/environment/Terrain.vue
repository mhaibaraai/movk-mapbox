<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'
import type { RasterDEMSourceSpecification } from '@maplibre/maplibre-gl-style-spec'
import { useMap } from '../../composables/useMap'
import { logger } from '../../utils/logger'

const props = withDefaults(defineProps<{
  /**
   * 地形夸张系数
   * @defaultValue 1
   */
  exaggeration?: number
  /**
   * DEM 数据源，如 Terrarium / Mapbox 编码的 raster-dem 瓦片
   * @see https://maplibre.org/maplibre-style-spec/sources/#raster-dem
   */
  source: RasterDEMSourceSpecification
  /**
   * DEM source id
   * @defaultValue 'movk-terrain-dem'
   */
  sourceId?: string
}>(), {
  exaggeration: 1,
  sourceId: 'movk-terrain-dem'
})

const ctx = useMap()

// 源与地形在同一回调内顺序建立，规避 onReady 注册顺序导致的 source 未就绪
function apply(map: MaplibreMap): void {
  if (!props.source) {
    logger.warn('MaplibreTerrain: missing required prop "source" (raster-dem source specification).')
    return
  }
  if (!map.getSource(props.sourceId)) {
    map.addSource(props.sourceId, props.source)
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
