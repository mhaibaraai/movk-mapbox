<script setup lang="ts">
import type { LightsSpecification } from 'mapbox-gl'

// 环境光 + 平行光（含投影），照亮 standard 样式的 3D 建筑
const lights: LightsSpecification[] = [
  { id: 'ambient', type: 'ambient', properties: { color: '#ffffff', intensity: 0.5 } },
  {
    id: 'directional',
    type: 'directional',
    properties: { 'color': '#ffffff', 'intensity': 0.8, 'direction': [210, 30], 'cast-shadows': true }
  }
]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{
        style: 'mapbox://styles/mapbox/standard',
        center: [116.473, 39.915],
        zoom: 16,
        pitch: 65,
        bearing: 30
      }"
    >
      <MapboxLights :lights="lights" />
    </MapboxMap>
  </div>
</template>
