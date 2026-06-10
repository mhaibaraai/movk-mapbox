<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

// 内联 source：直接给 MapboxLayer 传 source 对象，内部创建匿名源（id 派生自 layerId）
const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[
        [116.38, 39.89],
        [116.44, 39.89],
        [116.44, 39.94],
        [116.38, 39.94],
        [116.38, 39.89]
      ]]
    }
  }
}
</script>

<template>
  <MapShowcase
    title="内联 Source 便捷写法"
    description="单图层场景无需单独 MapboxSource：MapboxLayer 直接接 source 对象，省去样板。"
  >
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.41, 39.915], zoom: 12 }">
      <MapboxLayer
        layer-id="inline-area"
        type="fill"
        :source="source"
        :paint="{ 'fill-color': '#8b5cf6', 'fill-opacity': 0.4 }"
      />
    </MapboxMap>
  </MapShowcase>
</template>
