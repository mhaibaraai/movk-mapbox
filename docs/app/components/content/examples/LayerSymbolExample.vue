<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: '天安门' }, geometry: { type: 'Point', coordinates: [116.397, 39.908] } },
    { type: 'Feature', properties: { name: '国贸' }, geometry: { type: 'Point', coordinates: [116.461, 39.909] } },
    { type: 'Feature', properties: { name: '中关村' }, geometry: { type: 'Point', coordinates: [116.316, 39.983] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.93], zoom: 11 }">
      <!-- text-field 读取属性渲染文字标注，无需注册图标 -->
      <MapboxLayer
        layer-id="labels"
        type="symbol"
        :source="{ type: 'geojson', data }"
        :layout="{
          'text-field': ['get', 'name'],
          'text-size': 14,
          'text-offset': [0, 0.6],
          'text-anchor': 'top'
        }"
        :paint="{ 'text-color': '#1f2937', 'text-halo-color': '#fff', 'text-halo-width': 1.5 }"
      />
    </MapboxMap>
  </div>
</template>
