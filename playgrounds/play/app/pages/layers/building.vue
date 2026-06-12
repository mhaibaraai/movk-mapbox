<script setup lang="ts">
const color = ref('#8b9dc3')
const opacity = ref(0.85)
</script>

<template>
  <MapShowcase
    title="BuildingLayer 3D 建筑"
    description="MapboxBuildingLayer 便捷组件：fill-extrusion 预设按要素高度拉伸。依赖 Mapbox 官方样式的 composite/building 源，本页固定 light 样式。"
  >
    <template #toolbar>
      <input v-model="color" type="color" class="size-8 cursor-pointer rounded border border-default">
      <USlider v-model="opacity" :min="0.1" :max="1" :step="0.05" class="w-32" />
    </template>

    <DemoMap
      map-style="mapbox://styles/mapbox/light-v11"
      :center="[-74.0066, 40.7135]"
      :zoom="15.5"
      :pitch="60"
      :bearing="-17.6"
    >
      <MapboxBuildingLayer layer-id="3d-buildings" :color="color" :opacity="opacity" />
    </DemoMap>
  </MapShowcase>
</template>
