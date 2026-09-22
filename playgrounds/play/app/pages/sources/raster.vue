<script setup lang="ts">
import type { RasterSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

// OpenStreetMap 栅格瓦片，无需 token，演示纯栅格叠加
const source: RasterSourceSpecification = {
  type: 'raster',
  tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
  tileSize: 256,
  attribution: '© OpenStreetMap contributors'
}
</script>

<template>
  <MapShowcase
    title="Raster 栅格瓦片"
    description="raster 源经 tiles 模板加载切片，叠加为整幅栅格底图。"
  >
    <MaplibreMap :options="{ center: [116.39, 39.91], zoom: 9 }">
      <MaplibreSource source-id="osm" :source="source">
        <MaplibreLayer layer-id="osm-raster" type="raster" source="osm" />
      </MaplibreSource>
    </MaplibreMap>
  </MapShowcase>
</template>
