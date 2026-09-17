<script setup lang="ts">
import type { GeoJSONSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

const trailLength = ref(0.25)

const data: GeoJSONSourceSpecification['data'] = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'LineString',
    coordinates: [
      [116.35, 39.85],
      [116.42, 39.88],
      [116.46, 39.93],
      [116.41, 39.97],
      [116.33, 39.96],
      [116.30, 39.90]
    ]
  }
}
</script>

<template>
  <MapShowcase
    title="Trail 动态轨迹"
    description="line-gradient 彗尾窗口沿 line-progress 循环平移（source 开启 lineMetrics）。"
  >
    <template #toolbar>
      <span class="text-xs text-muted">彗尾长度</span>
      <USlider v-model="trailLength" :min="0.05" :max="0.6" :step="0.05" class="w-32" />
    </template>

    <DemoMap map-style="https://tiles.openfreemap.org/styles/dark" :center="[116.38, 39.91]" :zoom="11">
      <MaplibreTrail :data="data" color="#a78bfa" :line-width="5" :trail-length="trailLength" />
    </DemoMap>
  </MapShowcase>
</template>
