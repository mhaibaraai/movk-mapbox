<script setup lang="ts">
import { heatmapPaint } from '@movk/maplibre/utils/heatmap'
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: Array.from({ length: 200 }, (_, i) => ({
    type: 'Feature',
    properties: { temperature: (i * 37) % 40 },
    geometry: { type: 'Point', coordinates: [116.3 + ((i * 53) % 100) / 500, 39.85 + ((i * 71) % 100) / 600] }
  }))
}

const paint = heatmapPaint({ weightProperty: 'temperature', weightRange: [0, 40], radius: 28 })
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [116.4, 39.93], zoom: 11 }">
      <MaplibreLayer layer-id="heat" type="heatmap" :source="{ type: 'geojson', data }" :paint="paint" />
    </MaplibreMap>
  </div>
</template>
