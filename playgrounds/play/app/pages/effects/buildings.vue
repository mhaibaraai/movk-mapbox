<script setup lang="ts">
type Effect = 'gradient' | 'flow' | 'window' | 'texture'

const effect = ref<Effect>('gradient')

const items = [
  { label: '渐变', value: 'gradient' },
  { label: '流动', value: 'flow' },
  { label: '窗户', value: 'window' },
  { label: '纹理', value: 'texture' }
]
</script>

<template>
  <MapShowcase
    title="Building 特效"
    description="渐变/流动/窗户/纹理四类 3D 建筑特效,复用 BuildingLayer + useMapAnimation + 贴图。依赖 Mapbox 官方样式,本页固定 dark。"
  >
    <template #toolbar>
      <URadioGroup v-model="effect" orientation="horizontal" :items="items" />
    </template>

    <DemoMap
      map-style="mapbox://styles/mapbox/dark-v11"
      :center="[-74.0066, 40.7135]"
      :zoom="15.5"
      :pitch="60"
      :bearing="-17.6"
    >
      <MapboxGradientBuilding v-if="effect === 'gradient'" />
      <MapboxFlowBuilding v-else-if="effect === 'flow'" />
      <MapboxWindowBuilding v-else-if="effect === 'window'" :lit-ratio="0.5" />
      <MapboxTextureBuilding
        v-else
        url="https://docs.mapbox.com/mapbox-gl-js/assets/popup.png"
      />
    </DemoMap>
  </MapShowcase>
</template>
