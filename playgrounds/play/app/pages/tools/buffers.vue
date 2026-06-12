<script setup lang="ts">
type Shape = 'circle' | 'ellipse' | 'sector' | 'line' | 'polygon'

const shape = ref<Shape>('circle')
const size = ref(800)

const items = [
  { label: '圆', value: 'circle' },
  { label: '椭圆', value: 'ellipse' },
  { label: '扇形', value: 'sector' },
  { label: '线', value: 'line' },
  { label: '面', value: 'polygon' }
]

const center: [number, number] = [116.39, 39.91]
const line: [number, number][] = [[116.32, 39.88], [116.39, 39.93], [116.47, 39.90]]
const polygon: [number, number][] = [
  [116.36, 39.88],
  [116.43, 39.88],
  [116.44, 39.94],
  [116.37, 39.94],
  [116.36, 39.88]
]
</script>

<template>
  <MapShowcase
    title="Buffer 缓冲区"
    description="基于 @turf 子包的五类缓冲区组件，参数变化经 setData 原地变形（半径/宽度单位米）。"
  >
    <template #toolbar>
      <URadioGroup v-model="shape" orientation="horizontal" :items="items" />
      <USlider v-model="size" :min="200" :max="3000" :step="100" class="w-32" />
      <span class="text-xs text-muted">{{ size }} m</span>
    </template>

    <DemoMap :center="[116.40, 39.91]" :zoom="11">
      <MapboxBufferCircle v-if="shape === 'circle'" :center="center" :radius="size" />
      <MapboxBufferEllipse
        v-else-if="shape === 'ellipse'"
        :center="center"
        :x-semi-axis="size * 1.5"
        :y-semi-axis="size"
        :angle="30"
        color="#10b981"
      />
      <MapboxBufferSector
        v-else-if="shape === 'sector'"
        :center="center"
        :radius="size * 1.5"
        :bearing1="20"
        :bearing2="120"
        color="#f59e0b"
      />
      <MapboxBufferLine v-else-if="shape === 'line'" :line="line" :width="size / 2" color="#8b5cf6" />
      <MapboxBufferPolygon v-else :polygon="polygon" :width="size / 2" color="#f43f5e" />
    </DemoMap>
  </MapShowcase>
</template>
