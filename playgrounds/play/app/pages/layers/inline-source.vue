<script setup lang="ts">
import type { GeoJSONSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

// 内联 source：直接给 MaplibreLayer 传 source 对象，内部创建匿名源（id 派生自 layerId）
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
    description="单图层场景无需单独 MaplibreSource：MaplibreLayer 直接接 source 对象，省去样板。"
  >
    <DemoMap :center="[116.41, 39.915]" :zoom="12">
      <MaplibreLayer
        layer-id="inline-area"
        type="fill"
        :source="source"
        :paint="{ 'fill-color': '#8b5cf6', 'fill-opacity': 0.4 }"
      />
    </DemoMap>
  </MapShowcase>
</template>
