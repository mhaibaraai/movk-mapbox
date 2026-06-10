<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const opacity = ref(0.4)

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [116.36, 39.88],
        [116.45, 39.88],
        [116.46, 39.95],
        [116.37, 39.95],
        [116.36, 39.88]
      ]]
    }
  }
}

const paint = computed(() => ({
  'fill-color': '#3b82f6',
  'fill-opacity': opacity.value
}))
</script>

<template>
  <MapShowcase
    title="Fill 填充图层"
    description="多边形填充，叠加描边线图层勾勒边界。"
  >
    <template #toolbar>
      <USlider v-model="opacity" :min="0" :max="1" :step="0.05" class="w-32" />
    </template>

    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.41, 39.91], zoom: 11 }">
      <MapboxSource source-id="area" :source="source">
        <MapboxLayer layer-id="area-fill" type="fill" source="area" :paint="paint" />
        <MapboxLayer layer-id="area-outline" type="line" source="area" :paint="{ 'line-color': '#1d4ed8', 'line-width': 2 }" />
      </MapboxSource>
    </MapboxMap>
  </MapShowcase>
</template>
