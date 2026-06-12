<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'
import type { FeatureCollection } from 'geojson'

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

const source: GeoJSONSourceSpecification = { type: 'geojson', data: route }

const { flyTo, fitBounds } = useMapboxCamera({ mapId: 'camera-demo' })
</script>

<template>
  <MapShowcase
    title="useMapboxCamera 相机助手"
    description="flyTo/easeTo/jumpTo/fitBounds 封装；fitBounds 直接接受 GeoJSON，自动求包围盒。"
  >
    <template #toolbar>
      <UButton size="sm" @click="fitBounds(route, { padding: 60 })">
        缩放到路线
      </UButton>
      <UButton size="sm" variant="soft" @click="flyTo({ center: [116.39, 39.91], zoom: 12, pitch: 45 })">
        飞向北京
      </UButton>
    </template>

    <DemoMap map-id="camera-demo" :center="[117.5, 39.6]" :zoom="6">
      <MapboxSource source-id="trip" :source="source">
        <MapboxLayer
          layer-id="trip-line"
          type="line"
          source="trip"
          :layout="{ 'line-cap': 'round', 'line-join': 'round' }"
          :paint="{ 'line-color': '#8b5cf6', 'line-width': 4 }"
        />
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
