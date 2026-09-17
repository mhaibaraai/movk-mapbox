<script setup lang="ts">
// OpenFreeMap 样式自带 openmaptiles 矢量源，建筑高度字段为 render_height
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.461, 39.909], zoom: 15.5, pitch: 60, bearing: -20 }">
      <MaplibreBuildingLayer source="openmaptiles" source-layer="building" color="#94a3b8" :opacity="0.85" />
    </MaplibreMap>
  </div>
</template>
