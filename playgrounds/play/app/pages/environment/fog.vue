<script setup lang="ts">
const enabled = ref(true)

// 自定义大气：低空淡蓝、太空深蓝、星光强度
const options = {
  'range': [0.8, 8] as [number, number],
  'color': '#dce9f9',
  'high-color': '#245cdf',
  'space-color': '#0b1026',
  'star-intensity': 0.35
}
</script>

<template>
  <MapShowcase
    title="Fog 大气效果"
    description="MapboxFog 包装 setFog：globe 投影低缩放下呈现大气层与星空，卸载即清除。"
  >
    <template #toolbar>
      <USwitch v-model="enabled" label="开启大气" />
    </template>

    <DemoMap
      map-style="mapbox://styles/mapbox/satellite-streets-v12"
      :center="[116.39, 39.91]"
      :zoom="1.8"
      :pitch="40"
    >
      <MapboxFog v-if="enabled" :options="options" />
    </DemoMap>
  </MapShowcase>
</template>
