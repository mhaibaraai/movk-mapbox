<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

// setData 增量更新：改动 data 时 Source 内部走 setData，不整源重建
const points = ref<[number, number][]>([
  [116.39, 39.91],
  [116.45, 39.93],
  [116.35, 39.88]
])

const source = computed<GeoJSONSourceSpecification>(() => ({
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: points.value.map(coordinates => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates }
    }))
  }
}))

function addPoint() {
  points.value = [...points.value, [116.3 + Math.random() * 0.3, 39.85 + Math.random() * 0.15]]
}
</script>

<template>
  <MapShowcase
    title="GeoJSON 数据源"
    description="分离式 MapboxSource + MapboxLayer。响应式 data 变化经 setData 增量更新。"
    :state="{ count: points.length }"
  >
    <template #toolbar>
      <UButton size="xs" variant="soft" @click="addPoint">
        新增点
      </UButton>
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="11">
      <MapboxSource source-id="cities" :source="source">
        <MapboxLayer
          layer-id="cities-circle"
          type="circle"
          source="cities"
          :paint="{ 'circle-radius': 8, 'circle-color': '#10b981', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }"
        />
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
