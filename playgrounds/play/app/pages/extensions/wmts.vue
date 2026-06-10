<script setup lang="ts">
// NASA GIBS：公共、无需 token 的 WMTS GetTile 服务，演示非天地图参数（自定义 tms / image/jpeg）
const url = 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/wmts.cgi'
</script>

<template>
  <MapShowcase
    title="WMTS 图层"
    description="MapboxWmtsLayer 便捷组件：由结构化参数构造 WMTS GetTile（KVP）栅格源。此处用 NASA GIBS 全球影像（无需 token）。"
  >
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/empty-v9', center: [0, 20], zoom: 2 }">
      <MapboxWmtsLayer
        :url="url"
        layer="BlueMarble_ShadedRelief"
        tile-matrix-set="GoogleMapsCompatible_Level8"
        format="image/jpeg"
        attribution="© NASA GIBS"
      />
    </MapboxMap>
  </MapShowcase>
</template>
