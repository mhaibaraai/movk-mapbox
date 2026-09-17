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
    description="渐变/流动/窗户/纹理四类 3D 建筑特效,复用 BuildingLayer + useMapAnimation + 贴图。使用 OpenFreeMap dark 样式自带的 openmaptiles/building 源。"
  >
    <template #toolbar>
      <URadioGroup v-model="effect" orientation="horizontal" :items="items" />
    </template>

    <DemoMap
      map-style="https://tiles.openfreemap.org/styles/dark"
      :center="[-74.0066, 40.7135]"
      :zoom="15.5"
      :pitch="60"
      :bearing="-17.6"
    >
      <MaplibreGradientBuilding v-if="effect === 'gradient'" source="openmaptiles" source-layer="building" />
      <MaplibreFlowBuilding v-else-if="effect === 'flow'" source="openmaptiles" source-layer="building" />
      <MaplibreWindowBuilding v-else-if="effect === 'window'" source="openmaptiles" source-layer="building" :lit-ratio="0.5" />
      <MaplibreTextureBuilding
        v-else
        source="openmaptiles"
        source-layer="building"
        url="https://maplibre.org/maplibre-gl-js/docs/assets/popup.png"
      />
    </DemoMap>
  </MapShowcase>
</template>
