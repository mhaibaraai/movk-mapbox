<script setup lang="ts">
import { useTemplateRef } from 'vue'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
const drawRef = useTemplateRef('drawRef')

// 合并内置模式与 movk 自定义模式
const options = { displayControlsDefault: false, modes: { ...MapboxDraw.modes, ...movkDrawModes } }
</script>

<template>
  <div class="flex h-115 w-full flex-col gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <UButton size="xs" color="neutral" variant="subtle" @click="drawRef?.changeMode('draw_rectangle')">
        矩形
      </UButton>
      <UButton size="xs" color="neutral" variant="subtle" @click="drawRef?.changeMode('draw_circle')">
        圆
      </UButton>
      <UButton size="xs" color="neutral" variant="subtle" @click="drawRef?.changeMode('draw_ellipse')">
        椭圆
      </UButton>
      <UButton size="xs" color="neutral" variant="subtle" @click="drawRef?.changeMode('draw_sector')">
        扇形
      </UButton>
      <UButton size="xs" color="error" variant="subtle" @click="drawRef?.deleteAll()">
        清空
      </UButton>
    </div>
    <div class="relative flex-1 overflow-hidden rounded-(--ui-radius) border border-default">
      <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 11 }">
        <MapboxDrawControl ref="drawRef" v-model:features="features" :options="options" />
      </MapboxMap>
    </div>
  </div>
</template>
