<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

withDefaults(defineProps<{ radius?: number }>(), {
  radius: 40
})

// 各城市温度采样点（temperature 属性）
const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { temperature: 34 }, geometry: { type: 'Point', coordinates: [113.26, 23.13] } },
    { type: 'Feature', properties: { temperature: 30 }, geometry: { type: 'Point', coordinates: [121.47, 31.23] } },
    { type: 'Feature', properties: { temperature: 27 }, geometry: { type: 'Point', coordinates: [116.40, 39.90] } },
    { type: 'Feature', properties: { temperature: 22 }, geometry: { type: 'Point', coordinates: [104.07, 30.67] } },
    { type: 'Feature', properties: { temperature: 12 }, geometry: { type: 'Point', coordinates: [87.62, 43.79] } },
    { type: 'Feature', properties: { temperature: 5 }, geometry: { type: 'Point', coordinates: [126.63, 45.76] } },
    { type: 'Feature', properties: { temperature: 18 }, geometry: { type: 'Point', coordinates: [91.13, 29.65] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [105, 35], zoom: 3.4 }">
      <MapboxTemperature :data="data" :weight-range="[0, 40]" :radius="radius" />
    </MapboxMap>
  </div>
</template>
