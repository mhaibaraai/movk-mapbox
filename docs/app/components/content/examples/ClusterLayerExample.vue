<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: Array.from({ length: 150 }, (_, i) => ({
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Point',
      coordinates: [116.0 + ((i * 37) % 100) / 125, 39.7 + ((i * 53) % 100) / 167]
    }
  }))
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.4, 39.9], zoom: 9 }">
      <!-- 自动聚合：点击聚合圆放大展开，散点单独渲染 -->
      <MaplibreClusterLayer :data="data" />
    </MaplibreMap>
  </div>
</template>
