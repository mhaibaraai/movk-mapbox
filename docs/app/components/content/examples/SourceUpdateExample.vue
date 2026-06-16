<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

function randomPoints(count: number, seed: number): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: Array.from({ length: count }, (_, i) => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: [116.2 + ((i * seed) % 40) / 100, 39.8 + ((i * seed * 7) % 25) / 100]
      }
    }))
  }
}

const datasets = [randomPoints(12, 13), randomPoints(40, 31)]
const index = ref(0)

// source 为响应式：切换数据集仅触发 setData 增量更新，不重建源
const source = computed(() => ({ type: 'geojson' as const, data: datasets[index.value]! }))
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.4, 39.9], zoom: 10 }">
      <div class="absolute left-3 top-3 z-10">
        <UButton size="xs" color="neutral" variant="solid" @click="index = index === 0 ? 1 : 0">
          Toggle dataset
        </UButton>
      </div>
      <MapboxSource source-id="pts" :source="source">
        <MapboxLayer
          layer-id="pts"
          type="circle"
          source="pts"
          :paint="{ 'circle-radius': 6, 'circle-color': '#3b82f6', 'circle-opacity': 0.8 }"
        />
      </MapboxSource>
    </MapboxMap>
  </div>
</template>
