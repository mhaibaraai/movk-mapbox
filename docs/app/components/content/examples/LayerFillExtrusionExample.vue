<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { height: 800 }, geometry: { type: 'Polygon', coordinates: [[[116.38, 39.92], [116.40, 39.92], [116.40, 39.90], [116.38, 39.90], [116.38, 39.92]]] } },
    { type: 'Feature', properties: { height: 1600 }, geometry: { type: 'Polygon', coordinates: [[[116.41, 39.93], [116.43, 39.93], [116.43, 39.91], [116.41, 39.91], [116.41, 39.93]]] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.41, 39.91], zoom: 13, pitch: 55 }">
      <!-- fill-extrusion-height 读取属性挤出 3D 体块 -->
      <MapboxLayer
        layer-id="prisms"
        type="fill-extrusion"
        :source="{ type: 'geojson', data }"
        :paint="{
          'fill-extrusion-color': '#3b82f6',
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-opacity': 0.8
        }"
      />
    </MapboxMap>
  </div>
</template>
