<script setup lang="ts">
// 四角经纬度：左上 / 右上 / 右下 / 左下
const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
  [-80.425, 46.437],
  [-71.516, 46.437],
  [-71.516, 37.936],
  [-80.425, 37.936]
]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [-75.79, 42.1], zoom: 4 }">
      <MaplibreImageLayer
        url="https://maplibre.org/maplibre-gl-js/docs/assets/radar.gif"
        :coordinates="coordinates"
        :opacity="0.85"
      />
    </MaplibreMap>
  </div>
</template>
