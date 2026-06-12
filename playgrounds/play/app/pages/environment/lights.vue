<script setup lang="ts">
import type { LightsSpecification } from 'mapbox-gl'

const azimuth = ref(210)
const intensity = ref(0.5)

// ambient + directional 双灯；方位角驱动 3D 建筑阴影方向
const lights = computed<LightsSpecification[]>(() => [
  { id: 'ambient', type: 'ambient', properties: { intensity: 0.4 } },
  {
    id: 'sun',
    type: 'directional',
    properties: {
      'direction': [azimuth.value, 40],
      'intensity': intensity.value,
      'cast-shadows': true
    }
  }
])
</script>

<template>
  <MapShowcase
    title="Lights 3D 光照"
    description="MapboxLights 包装 setLights：环境光 + 平行光，拖动方位角观察建筑阴影变化。"
  >
    <template #toolbar>
      <span class="text-xs text-muted">方位角</span>
      <USlider v-model="azimuth" :min="0" :max="360" :step="5" class="w-32" />
      <span class="text-xs text-muted">强度</span>
      <USlider v-model="intensity" :min="0" :max="1" :step="0.05" class="w-24" />
    </template>

    <DemoMap
      map-style="mapbox://styles/mapbox/light-v11"
      :center="[-74.0066, 40.7135]"
      :zoom="15.5"
      :pitch="60"
      :bearing="-17.6"
    >
      <MapboxLights :lights="lights" />
      <MapboxBuildingLayer layer-id="lit-buildings" />
    </DemoMap>
  </MapShowcase>
</template>
