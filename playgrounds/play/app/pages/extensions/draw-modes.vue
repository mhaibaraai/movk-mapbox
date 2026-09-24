<script setup lang="ts">
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
const mode = ref('select')

const tools = [
  { label: '矩形', value: 'rectangle' },
  { label: '圆', value: 'circle' },
  { label: '椭圆', value: 'ellipse' },
  { label: '扇形', value: 'sector' },
  { label: '选择', value: 'select' }
]

const state = computed(() => ({ mode: mode.value, count: features.value.length }))
</script>

<template>
  <MapShowcase
    title="Draw 模式子集"
    description="modes 按名限定为规则图形：矩形 / 圆 / 椭圆 / 扇形，选择模式下可整体拖拽。"
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
      <MaplibreDrawControl
        v-model:features="features"
        v-model:mode="mode"
        position="top-left"
        :modes="['select', 'rectangle', 'circle', 'ellipse', 'sector']"
        :toolbar="false"
      />
    </DemoMap>
  </MapShowcase>
</template>
