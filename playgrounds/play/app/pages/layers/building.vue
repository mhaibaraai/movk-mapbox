<script setup lang="ts">
const color = ref('#8b9dc3')
const opacity = ref(0.85)
</script>

<template>
  <MapShowcase
    title="BuildingLayer 3D 建筑"
    description="MaplibreBuildingLayer 便捷组件：fill-extrusion 预设按要素高度拉伸。本页使用 OpenFreeMap positron 样式自带的 openmaptiles/building 源。"
  >
    <template #toolbar>
      <input v-model="color" type="color" class="size-8 cursor-pointer rounded border border-default">
      <USlider v-model="opacity" :min="0.1" :max="1" :step="0.05" class="w-32" />
    </template>

    <DemoMap
      map-style="https://tiles.openfreemap.org/styles/positron"
      :center="[-74.0066, 40.7135]"
      :zoom="15.5"
      :pitch="60"
      :bearing="-17.6"
    >
      <MaplibreBuildingLayer source="openmaptiles" source-layer="building" layer-id="3d-buildings" :color="color" :opacity="opacity" />
    </DemoMap>
  </MapShowcase>
</template>
