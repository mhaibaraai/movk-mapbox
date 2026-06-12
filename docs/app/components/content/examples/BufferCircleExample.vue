<script setup lang="ts">
const center: [number, number] = [116.397, 39.908]
const radius = ref(2000)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center, zoom: 11 }">
      <div class="absolute left-3 top-3 z-10 flex items-center gap-2 rounded-(--ui-radius) border border-default bg-default/80 px-3 py-1.5 backdrop-blur">
        <span class="text-sm text-muted">半径 {{ radius }}m</span>
        <USlider v-model="radius" :min="500" :max="5000" :step="500" class="w-32" />
      </div>
      <!-- turf 测地圆，半径单位米 -->
      <MapboxBufferCircle :center="center" :radius="radius" color="#3b82f6" />
    </MapboxMap>
  </div>
</template>
