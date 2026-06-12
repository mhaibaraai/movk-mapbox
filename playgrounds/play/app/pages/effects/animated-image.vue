<script setup lang="ts">
import type { FeatureCollection, Point } from 'geojson'

// 公开 CORS 动图(可替换为自有 GIF/APNG/WebP/AVIF URL);ImageDecoder 逐帧解码
const image = 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif'

const data: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [113.26, 23.13] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [113.31, 23.16] } }
  ]
}
</script>

<template>
  <MapShowcase
    title="AnimatedImage 动图图标"
    description="浏览器原生 ImageDecoder 逐帧解码 GIF/APNG/WebP/AVIF,按各帧时长循环驱动 symbol;零解码依赖,不支持的浏览器优雅降级。"
  >
    <DemoMap map-style="mapbox://styles/mapbox/dark-v11" :center="[113.285, 23.145]" :zoom="12">
      <MapboxAnimatedImage :data="data" :image="image" :size="80" />
    </DemoMap>
  </MapShowcase>
</template>
