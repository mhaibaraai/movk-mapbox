<script setup lang="ts">
// MapboxBuildingLayer 默认消费官方样式的 composite/building 矢量源
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }">
      <MapboxBuildingLayer color="#94a3b8" :opacity="0.85" />
    </MapboxMap>
  </div>
</template>
