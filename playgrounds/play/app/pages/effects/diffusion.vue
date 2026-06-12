<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const rings = ref(3)
const maxRadius = ref(40)

const data: GeoJSONSourceSpecification['data'] = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.909] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.31, 39.99] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.48, 39.95] } }
  ]
}
</script>

<template>
  <MapShowcase
    title="DiffusionCircle 扩散圆"
    description="多圈同心圆周期扩张渐隐，useMapAnimation 帧驱动 paint。"
  >
    <template #toolbar>
      <span class="text-xs text-muted">圈数</span>
      <USlider v-model="rings" :min="1" :max="5" :step="1" class="w-24" />
      <span class="text-xs text-muted">半径</span>
      <USlider v-model="maxRadius" :min="20" :max="80" :step="5" class="w-24" />
    </template>

    <DemoMap map-style="mapbox://styles/mapbox/dark-v11" :center="[116.39, 39.93]" :zoom="10.5">
      <MapboxDiffusionCircle :data="data" :rings="rings" :max-radius="maxRadius" color="#38bdf8" />
    </DemoMap>
  </MapShowcase>
</template>
