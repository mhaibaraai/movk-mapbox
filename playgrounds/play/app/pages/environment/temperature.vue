<script setup lang="ts">
import type { FeatureCollection, Point } from 'geojson'

const radius = ref(34)
const intensity = ref(1)

// 北京周边按相位撒点,温度随到中心距离递减(城市热岛示意)
const center: [number, number] = [116.4, 39.9]
const data: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: Array.from({ length: 320 }, (_, i) => {
    const angle = (i * 137.5 * Math.PI) / 180
    const r = Math.sqrt(i / 320) * 0.6
    const lng = center[0] + Math.cos(angle) * r
    const lat = center[1] + Math.sin(angle) * r * 0.8
    const temperature = Math.max(0, 38 - r * 52 + (i % 7) - 3)
    return {
      type: 'Feature' as const,
      properties: { temperature },
      geometry: { type: 'Point' as const, coordinates: [lng, lat] }
    }
  })
}
</script>

<template>
  <MapShowcase
    title="Temperature 温度热力"
    description="GeoJSON 点按 temperature 属性映射为 mapbox 原生 heatmap;滑块实时调整半径与强度。"
  >
    <template #toolbar>
      <span class="text-xs text-muted">半径</span>
      <USlider v-model="radius" :min="10" :max="60" :step="2" class="w-24" />
      <span class="text-xs text-muted">强度</span>
      <USlider v-model="intensity" :min="0.2" :max="3" :step="0.1" class="w-24" />
    </template>

    <DemoMap map-style="mapbox://styles/mapbox/dark-v11" :center="center" :zoom="9">
      <MapboxTemperature :data="data" :weight-range="[0, 40]" :radius="radius" :intensity="intensity" />
    </DemoMap>
  </MapShowcase>
</template>
