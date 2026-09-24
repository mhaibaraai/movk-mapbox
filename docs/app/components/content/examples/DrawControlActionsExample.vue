<script setup lang="ts">
import { useTemplateRef } from 'vue'
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
const drawRef = useTemplateRef('drawRef')

function draw(mode: string) {
  drawRef.value?.changeMode(mode)
}
</script>

<template>
  <div class="flex h-115 w-full flex-col gap-2">
    <div class="flex flex-wrap items-center gap-2">
      <UButton size="xs" color="neutral" variant="subtle" @click="draw('point')">
        点
      </UButton>
      <UButton size="xs" color="neutral" variant="subtle" @click="draw('linestring')">
        线
      </UButton>
      <UButton size="xs" color="neutral" variant="subtle" @click="draw('polygon')">
        面
      </UButton>
      <UButton size="xs" color="error" variant="subtle" @click="drawRef?.deleteAll()">
        清空
      </UButton>
      <span class="ml-auto text-xs text-muted">{{ features.length }} 个要素</span>
    </div>
    <div class="relative flex-1 overflow-hidden rounded-(--ui-radius) border border-default">
      <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.397, 39.908], zoom: 11 }">
        <MaplibreDrawControl ref="drawRef" v-model:features="features" :toolbar="false" />
      </MaplibreMap>
    </div>
  </div>
</template>
