<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

// 同一数据源同时供「实心圆」与「光晕」两个图层消费
const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.45, 39.93] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.35, 39.88] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.4, 39.9], zoom: 11 }">
      <MapboxSource source-id="cities" :source="{ type: 'geojson', data }">
        <MapboxLayer
          layer-id="cities-halo"
          type="circle"
          source="cities"
          :paint="{ 'circle-radius': 18, 'circle-color': '#3b82f6', 'circle-opacity': 0.2 }"
        />
        <MapboxLayer
          layer-id="cities-core"
          type="circle"
          source="cities"
          :paint="{ 'circle-radius': 7, 'circle-color': '#3b82f6' }"
        />
      </MapboxSource>
    </MapboxMap>
  </div>
</template>
