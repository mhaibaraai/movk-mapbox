<script setup lang="ts">
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.397, 39.908], zoom: 11 }">
      <!-- 工具栏按钮与 modes 顺序一致 -->
      <MaplibreDrawControl v-model:features="features" :modes="['select', 'rectangle', 'circle', 'ellipse', 'sector']" />
    </MaplibreMap>
  </div>
</template>
