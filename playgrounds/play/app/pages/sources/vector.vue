<script setup lang="ts">
import type { VectorSourceSpecification } from 'mapbox-gl'

// Mapbox Streets 矢量瓦片源，需 access token
const source: VectorSourceSpecification = {
  type: 'vector',
  url: 'mapbox://mapbox.mapbox-streets-v8'
}
</script>

<template>
  <MapShowcase
    title="Vector 矢量瓦片"
    description="vector 源经 url 引用矢量切片，图层用 source-layer 指定子图层（此处高亮道路）。"
  >
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 12 }">
      <MapboxSource source-id="streets" :source="source">
        <MapboxLayer
          layer-id="roads"
          type="line"
          source="streets"
          source-layer="road"
          :paint="{ 'line-color': '#6366f1', 'line-width': 1.5 }"
        />
      </MapboxSource>
    </MapboxMap>
  </MapShowcase>
</template>
