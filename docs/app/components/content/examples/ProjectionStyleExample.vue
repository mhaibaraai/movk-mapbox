<script setup lang="ts">
import type { StyleSpecification } from 'maplibre-gl'

const flat = ref(false)

// 样式自带 globe 投影；组件挂载时覆盖为 mercator，卸载后还原样式原值
const style: StyleSpecification = {
  version: 8,
  projection: { type: 'globe' },
  sources: {},
  layers: [{ id: 'background', type: 'background', paint: { 'background-color': '#0b1026' } }]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style, center: [105, 30], zoom: 1.5 }">
      <MaplibreTiandituLayer layer="img" />
      <div class="absolute left-3 top-3 z-10">
        <UButton size="xs" color="neutral" variant="solid" @click="flat = !flat">
          {{ flat ? 'Restore style projection' : 'Override with mercator' }}
        </UButton>
      </div>
      <MaplibreProjection v-if="flat" type="mercator" />
    </MaplibreMap>
  </div>
</template>
