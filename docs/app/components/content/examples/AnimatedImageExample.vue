<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 12 }">
      <!-- 自托管多帧动图（docs/public，同源无 CORS） -->
      <MapboxAnimatedImage
        :data="data"
        image="/animated-marker.gif"
        :size="64"
      />
    </MapboxMap>
  </div>
</template>
