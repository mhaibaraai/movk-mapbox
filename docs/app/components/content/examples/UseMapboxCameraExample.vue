<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const mapId = 'use-mapbox-camera-demo'

const route: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [116.39, 39.91],
          [117.20, 39.13],
          [118.18, 39.63],
          [119.60, 39.94]
        ]
      }
    }
  ]
}

const { flyTo, fitBounds } = useMapboxCamera({ mapId })
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :map-id="mapId" :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [117.5, 39.6], zoom: 6 }">
      <MapboxLayer
        layer-id="route"
        type="line"
        :source="{ type: 'geojson', data: route }"
        :layout="{ 'line-cap': 'round', 'line-join': 'round' }"
        :paint="{ 'line-color': '#8b5cf6', 'line-width': 4 }"
      />
    </MapboxMap>
    <div class="absolute left-2 top-2 z-10 flex gap-1">
      <UButton size="sm" @click="fitBounds(route, { padding: 60 })">
        缩放到路线
      </UButton>
      <UButton size="sm" variant="soft" @click="flyTo({ center: [116.39, 39.91], zoom: 11, pitch: 45 })">
        飞向北京
      </UButton>
    </div>
  </div>
</template>
