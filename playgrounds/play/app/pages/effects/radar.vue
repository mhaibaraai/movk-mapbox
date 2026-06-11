<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const speed = ref(120)
const radius = ref(70)

const data: GeoJSONSourceSpecification['data'] = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [113.26, 23.13] } }
  ]
}
</script>

<template>
  <MapShowcase
    title="Radar 雷达扫描"
    description="canvas 生成角向渐变扫描贴图，icon-rotate 帧驱动旋转;icon 随地图对齐。"
  >
    <template #toolbar>
      <span class="text-xs text-muted">速度</span>
      <USlider v-model="speed" :min="30" :max="360" :step="10" class="w-24" />
      <span class="text-xs text-muted">半径</span>
      <USlider v-model="radius" :min="40" :max="120" :step="10" class="w-24" />
    </template>

    <DemoMap map-style="mapbox://styles/mapbox/dark-v11" :center="[113.26, 23.13]" :zoom="12">
      <MapboxRadar :data="data" color="#22c55e" :radius="radius" :speed="speed" />
    </DemoMap>
  </MapShowcase>
</template>
