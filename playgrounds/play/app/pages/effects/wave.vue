<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const data: GeoJSONSourceSpecification['data'] = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [120.15, 30.27] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [120.21, 30.21] } }
  ]
}
</script>

<template>
  <MapShowcase
    title="WaveCircle 波浪圆"
    description="常驻底圆 + 周期扩张的描边波纹，与扩散圆共享相位驱动。"
  >
    <DemoMap map-style="mapbox://styles/mapbox/dark-v11" :center="[120.18, 30.24]" :zoom="11.5">
      <MapboxWaveCircle :data="data" color="#34d399" :base-radius="6" :max-radius="36" />
    </DemoMap>
  </MapShowcase>
</template>
