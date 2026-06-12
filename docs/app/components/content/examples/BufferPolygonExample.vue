<script setup lang="ts">
const polygon: [number, number][] = [
  [116.38, 39.94],
  [116.44, 39.94],
  [116.44, 39.89],
  [116.38, 39.89],
  [116.38, 39.94]
]
const width = ref(800)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.41, 39.915], zoom: 11 }">
      <div class="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-(--ui-radius) border border-default bg-default/80 px-3 py-1.5 backdrop-blur">
        <span class="text-sm text-muted">宽度 {{ width }}m</span>
        <USlider v-model="width" :min="-400" :max="1500" :step="100" class="w-32" />
      </div>
      <!-- 正值向外扩展、负值向内收缩 -->
      <MapboxBufferPolygon :polygon="polygon" :width="width" color="#8b5cf6" />
    </MapboxMap>
  </div>
</template>
