<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const radius = ref(8)
const color = ref('#10b981')

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: Array.from({ length: 30 }, () => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [116.2 + Math.random() * 0.4, 39.8 + Math.random() * 0.25] }
    }))
  }
}

const paint = computed(() => ({
  'circle-radius': radius.value,
  'circle-color': color.value,
  'circle-opacity': 0.8
}))
</script>

<template>
  <MapShowcase
    title="Circle 圆点图层"
    description="响应式 paint：调整半径/颜色仅触发 setPaintProperty 增量更新，不重建图层。"
  >
    <template #toolbar>
      <USlider v-model="radius" :min="2" :max="20" class="w-32" />
      <UInput v-model="color" size="xs" class="w-28" />
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="10">
      <MapboxSource source-id="dots" :source="source">
        <MapboxLayer layer-id="dots" type="circle" source="dots" :paint="paint" />
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
