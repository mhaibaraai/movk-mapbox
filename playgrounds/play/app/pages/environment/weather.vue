<script setup lang="ts">
const weather = ref<'none' | 'rain' | 'snow'>('rain')

const items = [
  { label: '无', value: 'none' },
  { label: '雨', value: 'rain' },
  { label: '雪', value: 'snow' }
]
</script>

<template>
  <MapShowcase
    title="Rain / Snow 天气效果"
    description="MapboxRain / MapboxSnow 包装 mapbox v3 原生（实验性）setRain/setSnow，切换即挂载/卸载对应组件。"
  >
    <template #toolbar>
      <URadioGroup v-model="weather" orientation="horizontal" :items="items" />
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="15" :pitch="55">
      <MapboxRain v-if="weather === 'rain'" />
      <MapboxSnow v-if="weather === 'snow'" />
    </DemoMap>
  </MapShowcase>
</template>
