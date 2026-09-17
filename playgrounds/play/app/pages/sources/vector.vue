<script setup lang="ts">
import type { VectorSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

// OpenFreeMap 矢量瓦片（OpenMapTiles 规范），无需 key
const source: VectorSourceSpecification = {
  type: 'vector',
  url: 'https://tiles.openfreemap.org/planet'
}
</script>

<template>
  <MapShowcase
    title="Vector 矢量瓦片"
    description="vector 源经 url 引用矢量切片，图层用 source-layer 指定子图层（此处高亮道路）。"
  >
    <DemoMap :center="[116.39, 39.91]" :zoom="12">
      <MaplibreSource source-id="streets" :source="source">
        <MaplibreLayer
          layer-id="roads"
          type="line"
          source="streets"
          source-layer="transportation"
          :paint="{ 'line-color': '#6366f1', 'line-width': 1.5 }"
        />
      </MaplibreSource>
    </DemoMap>
  </MapShowcase>
</template>
