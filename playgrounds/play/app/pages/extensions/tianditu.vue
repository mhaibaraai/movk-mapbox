<script setup lang="ts">
import type { TiandituLayerType } from '#mapbox/utils/tianditu'

const layer = ref<TiandituLayerType>('vec')
const annotation = ref(true)
const options = [
  { label: '矢量底图 vec', value: 'vec' },
  { label: '影像底图 img', value: 'img' },
  { label: '地形晕渲 ter', value: 'ter' }
]
</script>

<template>
  <MapShowcase
    title="天地图底图"
    description="MapboxTiandituLayer 便捷组件：web-mercator 栅格预设。annotation 可叠加对应注记（vec→cva / img→cia / ter→cta），切换类型时旧图层正确移除（需配置 tiandituToken）。"
    :state="{ layer, annotation }"
  >
    <template #toolbar>
      <USelect v-model="layer" :items="options" value-key="value" size="xs" class="w-44" />
      <USwitch v-model="annotation" label="显示注记" />
    </template>

    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/empty-v9', center: [116.39, 39.91], zoom: 9 }">
      <MapboxTiandituLayer :layer="layer" :annotation="annotation" />
    </MapboxMap>
  </MapShowcase>
</template>
