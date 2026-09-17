<script setup lang="ts">
import type { ImageSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

// image 源把单张图片贴合到四角坐标（左上→右上→右下→左下）
const source: ImageSourceSpecification = {
  type: 'image',
  url: 'https://maplibre.org/maplibre-gl-js/docs/assets/radar.gif',
  coordinates: [
    [-80.425, 46.437],
    [-71.516, 46.437],
    [-71.516, 37.936],
    [-80.425, 37.936]
  ]
}
</script>

<template>
  <MapShowcase
    title="Image 图片数据源"
    description="image 源将一张图片按四角经纬度贴合到地图，常用于雷达/航拍叠加。"
  >
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [-75.79, 41.84], zoom: 4 }">
      <MaplibreSource source-id="radar" :source="source">
        <MaplibreLayer
          layer-id="radar-layer"
          type="raster"
          source="radar"
          :paint="{ 'raster-fade-duration': 0, 'raster-opacity': 0.85 }"
        />
      </MaplibreSource>
    </MaplibreMap>
  </MapShowcase>
</template>
