<script setup lang="ts">
import type { Map as MapboxMap } from 'mapbox-gl'

const status = ref('initializing')

function onLoad(_map: MapboxMap) {
  status.value = 'loaded'
}
</script>

<template>
  <MapShowcase
    title="基础地图"
    description="最小用法：传入 style 与初始相机，组件在客户端挂载后创建实例。Nuxt 下无需 ClientOnly 包裹。"
    :state="{ status }"
    state-label="Map"
  >
    <MapboxMap
      :options="{ style: 'mapbox://styles/mapbox/streets-v12', center: [116.39, 39.91], zoom: 10 }"
      @load="onLoad"
    />
  </MapShowcase>
</template>
