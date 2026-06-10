<script setup lang="ts">
import type { ImageSourceSpecification } from 'mapbox-gl'

// image 源把单张图片贴合到四角坐标（左上→右上→右下→左下）
const source: ImageSourceSpecification = {
  type: 'image',
  url: 'https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif',
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
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/dark-v11', center: [-75.79, 41.84], zoom: 4 }">
      <MapboxSource source-id="radar" :source="source">
        <MapboxLayer
          layer-id="radar-layer"
          type="raster"
          source="radar"
          :paint="{ 'raster-fade-duration': 0, 'raster-opacity': 0.85 }"
        />
      </MapboxSource>
    </MapboxMap>
  </MapShowcase>
</template>
