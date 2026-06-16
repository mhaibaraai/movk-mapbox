<script setup lang="ts">
const mapId = 'use-measure-demo'

const { start, stop, clear, mode, active, result } = useMeasure({ mapId })
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :map-id="mapId" :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 11 }" />
    <div class="absolute left-2 top-2 z-10 flex gap-1">
      <UButton size="sm" :variant="active && mode === 'distance' ? 'solid' : 'soft'" @click="start('distance')">
        测距
      </UButton>
      <UButton size="sm" :variant="active && mode === 'area' ? 'solid' : 'soft'" @click="start('area')">
        测面
      </UButton>
      <UButton size="sm" variant="soft" :disabled="!active" @click="stop">
        结束
      </UButton>
      <UButton size="sm" color="error" variant="soft" @click="clear">
        清空
      </UButton>
    </div>
    <div v-if="result" class="absolute bottom-2 left-2 z-10 rounded bg-default/90 px-3 py-1.5 text-sm font-medium text-default ring ring-default">
      {{ result }}
    </div>
  </div>
</template>
