<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

withDefaults(defineProps<{ color?: string }>(), {
  color: '#10b981'
})

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.46, 39.92] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/dark-v11', center: [116.43, 39.913], zoom: 11 }">
      <MapboxWaveCircle :data="data" :color="color" />
    </MapboxMap>
  </div>
</template>
