<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const props = withDefaults(defineProps<{
  radius?: number
  color?: string
}>(), {
  radius: 10,
  color: '#f43f5e'
})

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.45, 39.93] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.35, 39.88] } }
  ]
}

// paint 随 props 响应：仅触发 setPaintProperty 增量更新，不重建图层
const paint = computed(() => ({
  'circle-radius': props.radius,
  'circle-color': props.color,
  'circle-stroke-width': 2,
  'circle-stroke-color': '#fff'
}))
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.4, 39.9], zoom: 11 }">
      <MapboxLayer
        layer-id="points"
        type="circle"
        :source="{ type: 'geojson', data }"
        :paint="paint"
      />
    </MapboxMap>
  </div>
</template>
