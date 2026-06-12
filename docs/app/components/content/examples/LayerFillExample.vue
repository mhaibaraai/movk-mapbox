<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { c: '#3b82f6' }, geometry: { type: 'Polygon', coordinates: [[[116.34, 39.96], [116.40, 39.96], [116.40, 39.91], [116.34, 39.91], [116.34, 39.96]]] } },
    { type: 'Feature', properties: { c: '#f59e0b' }, geometry: { type: 'Polygon', coordinates: [[[116.41, 39.94], [116.47, 39.94], [116.47, 39.89], [116.41, 39.89], [116.41, 39.94]]] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.4, 39.92], zoom: 11 }">
      <!-- fill-color 用 ['get'] 读取要素属性，逐要素着色 -->
      <MapboxLayer
        layer-id="zones"
        type="fill"
        :source="{ type: 'geojson', data }"
        :paint="{ 'fill-color': ['get', 'c'], 'fill-opacity': 0.4 }"
      />
    </MapboxMap>
  </div>
</template>
