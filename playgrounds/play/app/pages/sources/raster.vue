<script setup lang="ts">
import type { RasterSourceSpecification } from 'mapbox-gl'

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
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/empty-v9', center: [116.39, 39.91], zoom: 9 }">
      <MapboxSource source-id="osm" :source="source">
        <MapboxLayer layer-id="osm-raster" type="raster" source="osm" />
      </MapboxSource>
    </MapboxMap>
  </MapShowcase>
</template>
