<script setup lang="ts">
const exaggeration = ref(1.5)
</script>

<template>
  <MapShowcase
    title="Terrain 3D 地形"
    description="MapboxTerrain 内部接管 DEM 源并 setTerrain，滑块实时调整夸张系数。本页固定卫星样式展示珠峰。"
  >
    <template #toolbar>
      <USlider v-model="exaggeration" :min="0" :max="3" :step="0.1" class="w-32" />
      <span class="text-xs text-muted">×{{ exaggeration.toFixed(1) }}</span>
    </template>

    <DemoMap
      map-style="mapbox://styles/mapbox/satellite-streets-v12"
      :center="[86.925, 27.95]"
      :zoom="12"
      :pitch="70"
      :bearing="100"
    >
      <MapboxTerrain :exaggeration="exaggeration" />
      <MapboxFog />
    </DemoMap>
  </MapShowcase>
</template>
