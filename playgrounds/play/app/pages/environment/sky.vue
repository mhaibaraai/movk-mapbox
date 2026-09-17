<script setup lang="ts">
import type { SkySpecification } from '@maplibre/maplibre-gl-style-spec'

const enabled = ref(true)

// 自定义天空：天顶深蓝、地平线暖白、雾色融入，atmosphere-blend 控制 globe 大气光晕
const options: SkySpecification = {
  'sky-color': '#199EF3',
  'horizon-color': '#f0f8ff',
  'fog-color': '#ffffff',
  'sky-horizon-blend': 0.5,
  'horizon-fog-blend': 0.6,
  'fog-ground-blend': 0.4,
  'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 10, 1, 12, 0]
}
</script>

<template>
  <MapShowcase
    title="Sky 天空与大气"
    description="MaplibreSky 包装 setSky：大俯仰角下呈现天空与地平线雾化，globe 投影低缩放下呈现大气光晕，卸载即恢复默认。"
  >
    <template #toolbar>
      <USwitch v-model="enabled" label="开启天空" />
    </template>

    <DemoMap
      map-style="https://tiles.openfreemap.org/styles/liberty"
      :center="[116.39, 39.91]"
      :zoom="12"
      :pitch="75"
    >
      <MaplibreSky v-if="enabled" :options="options" />
    </DemoMap>
  </MapShowcase>
</template>
