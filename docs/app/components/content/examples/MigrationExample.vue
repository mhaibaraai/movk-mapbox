<script setup lang="ts">
withDefaults(defineProps<{ color?: string }>(), {
  color: '#f43f5e'
})

// 自北京出发的迁徙航线
const routes: { from: [number, number], to: [number, number] }[] = [
  { from: [116.40, 39.90], to: [121.47, 31.23] },
  { from: [116.40, 39.90], to: [113.26, 23.13] },
  { from: [116.40, 39.90], to: [104.07, 30.67] },
  { from: [116.40, 39.90], to: [87.62, 43.79] }
]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/dark-v11', center: [104, 36], zoom: 3.2 }">
      <MapboxMigration :data="routes" :color="color" />
    </MapboxMap>
  </div>
</template>
