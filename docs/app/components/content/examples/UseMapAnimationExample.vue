<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const mapId = 'use-map-animation-demo'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } }
  ]
}

// 每帧驱动 circle-radius 周期脉动；图层未就绪时跳过
useMapAnimation((map, elapsed) => {
  if (!map.getLayer('pulse')) return
  map.setPaintProperty('pulse', 'circle-radius', 14 + 8 * Math.sin(elapsed / 400))
}, { mapId })
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :map-id="mapId" :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [116.397, 39.908], zoom: 12 }">
      <MaplibreLayer
        layer-id="pulse"
        type="circle"
        :source="{ type: 'geojson', data }"
        :paint="{ 'circle-color': '#22d3ee', 'circle-opacity': 0.6, 'circle-radius': 14 }"
      />
    </MaplibreMap>
  </div>
</template>
