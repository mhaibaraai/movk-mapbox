<script setup lang="ts">
import type { RasterDEMSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

const exaggeration = ref(1.5)

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
  <MapShowcase
    title="Terrain 3D 地形"
    description="MaplibreTerrain 以传入的 raster-dem 源 setTerrain，滑块实时调整夸张系数。本页叠加天地图影像展示珠峰。"
  >
    <template #toolbar>
      <USlider v-model="exaggeration" :min="0" :max="3" :step="0.1" class="w-32" />
      <span class="text-xs text-muted">×{{ exaggeration.toFixed(1) }}</span>
    </template>

    <MaplibreMap :options="{ center: [86.925, 27.95], zoom: 12, pitch: 70, maxPitch: 85, bearing: 100 }">
      <MaplibreTiandituLayer layer="img" annotation />
      <MaplibreTerrain :source="dem" :exaggeration="exaggeration" />
      <MaplibreSky />
    </MaplibreMap>
  </MapShowcase>
</template>
