<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const pulse = ref(true)

const data: GeoJSONSourceSpecification['data'] = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [121.47, 31.23] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [121.52, 31.25] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [121.44, 31.20] } }
  ]
}
</script>

<template>
  <MapShowcase
    title="GlowCircle 炫光圆"
    description="实心内核 + circle-blur 光晕，可选呼吸脉冲。"
  >
    <template #toolbar>
      <USwitch v-model="pulse" label="呼吸脉冲" />
    </template>

    <DemoMap map-style="mapbox://styles/mapbox/dark-v11" :center="[121.48, 31.23]" :zoom="11.5">
      <!-- pulse 经 key 重建以切换帧循环启停 -->
      <MapboxGlowCircle :key="String(pulse)" :data="data" color="#fbbf24" :radius="7" :pulse="pulse" />
    </DemoMap>
  </MapShowcase>
</template>
