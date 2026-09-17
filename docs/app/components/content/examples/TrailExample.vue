<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

withDefaults(defineProps<{ color?: string }>(), {
  color: '#8b5cf6'
})

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [[116.30, 39.90], [116.40, 39.94], [116.50, 39.91], [116.46, 39.85], [116.36, 39.87]]
    }
  }]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [116.41, 39.90], zoom: 11 }">
      <MaplibreTrail :data="data" :color="color" />
    </MaplibreMap>
  </div>
</template>
