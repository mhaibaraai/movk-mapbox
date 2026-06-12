<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [[116.32, 39.88], [116.38, 39.92], [116.44, 39.90], [116.50, 39.95]]
    }
  }]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.41, 39.91], zoom: 11 }">
      <MapboxLayer
        layer-id="route"
        type="line"
        :source="{ type: 'geojson', data }"
        :layout="{ 'line-cap': 'round', 'line-join': 'round' }"
        :paint="{ 'line-color': '#f43f5e', 'line-width': 4 }"
      />
    </MapboxMap>
  </div>
</template>
