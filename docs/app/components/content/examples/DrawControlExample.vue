<script setup lang="ts">
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 11 }">
      <MapboxDrawControl v-model:features="features" position="top-left" />
    </MapboxMap>
    <div class="absolute top-2 right-2 z-10 rounded bg-default/90 px-2 py-1 text-xs text-default ring ring-default">
      已绘制 {{ features.length }} 个要素
    </div>
  </div>
</template>
