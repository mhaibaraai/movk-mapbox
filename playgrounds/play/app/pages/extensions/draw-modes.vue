<script setup lang="ts">
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
const mode = ref('simple_select')

// 基础模式 + movk 自定义模式(矩形/圆/椭圆/扇形)
const options = {
  displayControlsDefault: false,
  modes: { ...MapboxDraw.modes, ...movkDrawModes }
}

const tools = [
  { label: '矩形', value: 'draw_rectangle' },
  { label: '圆', value: 'draw_circle' },
  { label: '椭圆', value: 'draw_ellipse' },
  { label: '扇形', value: 'draw_sector' },
  { label: '选择', value: 'simple_select' }
]

const state = computed(() => ({ mode: mode.value, count: features.value.length }))
</script>

<template>
  <MapShowcase
    title="Draw 自定义模式"
    description="矩形/圆/椭圆/扇形四个 turf 驱动的自定义绘制模式;圆与扇形 properties 记录几何参数。"
    :state="state"
  >
    <template #toolbar>
      <UButton
        v-for="t in tools"
        :key="t.value"
        size="sm"
        :variant="mode === t.value ? 'solid' : 'soft'"
        @click="mode = t.value"
      >
        {{ t.label }}
      </UButton>
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="12">
      <MapboxDrawControl
        v-model:features="features"
        v-model:mode="mode"
        position="top-left"
        :options="options"
      />
    </DemoMap>
  </MapShowcase>
</template>
