<script setup lang="ts">
import type { RasterDEMSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

withDefaults(defineProps<{ exaggeration?: number }>(), {
  exaggeration: 1.5
})

// 公开 Terrarium 编码高程瓦片，无需 key
const dem: RasterDEMSourceSpecification = {
  type: 'raster-dem',
  tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
  encoding: 'terrarium',
  tileSize: 256,
  maxzoom: 15,
  attribution: '© Mapzen, AWS Terrain Tiles'
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap
      :options="{
        center: [86.925, 27.989],
        zoom: 12,
        pitch: 76,
        maxPitch: 85,
        bearing: 40
      }"
    >
      <MaplibreTiandituLayer layer="img" annotation />
      <MaplibreTerrain :source="dem" :exaggeration="exaggeration" />
    </MaplibreMap>
  </div>
</template>
