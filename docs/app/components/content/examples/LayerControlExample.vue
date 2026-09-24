<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const stations: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.45, 39.93] } }
  ]
}

const zone: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[116.36, 39.95], [116.44, 39.95], [116.44, 39.89], [116.36, 39.89], [116.36, 39.95]]] } }]
}

const open = ref(true)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.41, 39.92], zoom: 11 }">
      <MaplibreLayerGroup title="规划片区">
        <MaplibreLayer layer-id="lc-zone" type="fill" :source="{ type: 'geojson', data: zone }" :paint="{ 'fill-color': '#f59e0b', 'fill-opacity': 0.4 }" />
      </MaplibreLayerGroup>
      <MaplibreLayerGroup title="站点">
        <MaplibreLayer layer-id="lc-stations" type="circle" :source="{ type: 'geojson', data: stations }" :paint="{ 'circle-radius': 8, 'circle-color': '#3b82f6', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }" />
      </MaplibreLayerGroup>
      <MaplibreLayerControl v-model:open="open" position="top-left" />
    </MaplibreMap>
  </div>
</template>
