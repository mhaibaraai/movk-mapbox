<script setup lang="ts">
import type { ProjectionDefinitionSpecification } from '@maplibre/maplibre-gl-style-spec'

const mode = ref<'globe' | 'transition' | 'off'>('globe')

// 缩放过渡：zoom 10 以下为球体，10~12 平滑过渡为平面
const transition: ProjectionDefinitionSpecification = ['interpolate', ['linear'], ['zoom'], 10, 'vertical-perspective', 12, 'mercator']

const items = [
  { label: '球体', value: 'globe' },
  { label: '缩放过渡', value: 'transition' },
  { label: '卸载组件', value: 'off' }
]
</script>

<template>
  <MapShowcase
    title="Projection 球形投影"
    description="MaplibreProjection 包装 setProjection：缺省 globe，支持按 zoom 插值过渡；setStyle 后自动重设，卸载还原样式原值。"
  >
    <template #toolbar>
      <URadioGroup v-model="mode" orientation="horizontal" :items="items" />
    </template>

    <DemoMap
      map-style="https://tiles.openfreemap.org/styles/liberty"
      :center="[105, 30]"
      :zoom="1.5"
    >
      <MaplibreProjection v-if="mode !== 'off'" :type="mode === 'transition' ? transition : 'globe'" />
      <MaplibreSky :options="{ 'atmosphere-blend': ['interpolate', ['linear'], ['zoom'], 0, 1, 5, 1, 7, 0] }" />
      <MaplibreGlobeControl position="top-right" />
    </DemoMap>
  </MapShowcase>
</template>
