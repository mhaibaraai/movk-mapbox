<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

// 每个点带 value 属性，paint 用表达式按属性分级映射半径与颜色
const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: Array.from({ length: 40 }, (_, i) => ({
    type: 'Feature',
    properties: { value: (i * 37) % 100 },
    geometry: {
      type: 'Point',
      coordinates: [116.2 + ((i * 13) % 40) / 100, 39.8 + ((i * 29) % 25) / 100]
    }
  }))
}

const paint = {
  'circle-radius': ['interpolate', ['linear'], ['get', 'value'], 0, 4, 100, 20],
  'circle-color': ['interpolate', ['linear'], ['get', 'value'], 0, '#3b82f6', 50, '#f59e0b', 100, '#ef4444'],
  'circle-opacity': 0.85
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.4, 39.9], zoom: 10 }">
      <MapboxLayer
        layer-id="graduated"
        type="circle"
        :source="{ type: 'geojson', data }"
        :paint="paint"
      />
    </MapboxMap>
  </div>
</template>
