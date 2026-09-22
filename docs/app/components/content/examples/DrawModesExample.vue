<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
const drawRef = useTemplateRef('drawRef')
</script>

<template>
  <div class="flex h-115 w-full flex-col gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <UButton size="xs" color="neutral" variant="subtle" @click="drawRef?.changeMode('rectangle')">
        矩形
      </UButton>
      <UButton size="xs" color="neutral" variant="subtle" @click="drawRef?.changeMode('circle')">
        圆
      </UButton>
      <UButton size="xs" color="neutral" variant="subtle" @click="drawRef?.changeMode('ellipse')">
        椭圆
      </UButton>
      <UButton size="xs" color="neutral" variant="subtle" @click="drawRef?.changeMode('sector')">
        扇形
      </UButton>
      <UButton size="xs" color="error" variant="subtle" @click="drawRef?.deleteAll()">
        清空
      </UButton>
    </div>
    <div class="relative flex-1 overflow-hidden rounded-(--ui-radius) border border-default">
      <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.397, 39.908], zoom: 11 }">
        <MaplibreDrawControl ref="drawRef" v-model:features="features" :controls="false" />
      </MaplibreMap>
    </div>
  </div>
</template>
