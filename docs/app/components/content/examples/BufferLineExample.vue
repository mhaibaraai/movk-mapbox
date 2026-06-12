<script setup lang="ts">
const line: [number, number][] = [
  [116.34, 39.88],
  [116.40, 39.92],
  [116.46, 39.90],
  [116.50, 39.94]
]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.42, 39.91], zoom: 11 }">
      <!-- 沿线两侧扩展 width 米的走廊面 -->
      <MapboxBufferLine :line="line" :width="600" color="#10b981" />
    </MapboxMap>
  </div>
</template>
