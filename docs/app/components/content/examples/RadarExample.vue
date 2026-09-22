<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

withDefaults(defineProps<{ speed?: number }>(), {
  speed: 120
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
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [116.43, 39.913], zoom: 11 }">
      <MaplibreRadar :data="data" :speed="speed" color="#22c55e" />
    </MaplibreMap>
  </div>
</template>
