<script setup lang="ts">
import { boundsOfGeoJSON } from '@movk/mapbox/utils/geometry'
import type { FeatureCollection } from 'geojson'

const mapId = 'geometry-bounds-demo'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [[116.39, 39.91], [117.20, 39.13], [118.18, 39.63], [119.60, 39.94]]
      }
    }
  ]
}

const bounds = boundsOfGeoJSON(data)

// 把包围盒元组转成矩形要素用于可视化
const bbox: FeatureCollection | undefined = bounds && {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [bounds[0][0], bounds[0][1]], [bounds[1][0], bounds[0][1]],
        [bounds[1][0], bounds[1][1]], [bounds[0][0], bounds[1][1]], [bounds[0][0], bounds[0][1]]
      ]]
    }
  }]
}

const { fitBounds } = useMapboxCamera({ mapId })
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :map-id="mapId" :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [117.5, 39.6], zoom: 6 }">
      <MapboxLayer layer-id="geo-line" type="line" :source="{ type: 'geojson', data }" :paint="{ 'line-color': '#8b5cf6', 'line-width': 3 }" />
      <MapboxSource v-if="bbox" source-id="geo-bbox" :source="{ type: 'geojson', data: bbox }">
        <MapboxLayer layer-id="geo-bbox-line" type="line" source="geo-bbox" :paint="{ 'line-color': '#f59e0b', 'line-width': 1, 'line-dasharray': [2, 2] }" />
      </MapboxSource>
    </MapboxMap>
    <div class="absolute left-2 top-2 z-10">
      <UButton size="sm" :disabled="!bounds" @click="bounds && fitBounds(bounds, { padding: 40 })">
        缩放到包围盒
      </UButton>
    </div>
  </div>
</template>
