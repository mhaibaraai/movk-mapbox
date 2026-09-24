<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const active = ref(false)

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.45, 39.93] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.35, 39.88] } }
  ]
}
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.4, 39.9], zoom: 11 }">
      <MaplibreNavigationControl position="top-right" />
      <MaplibreLayer
        layer-id="swipe-toggle-points"
        type="circle"
        :source="{ type: 'geojson', data }"
        :paint="{ 'circle-radius': 8, 'circle-color': '#f43f5e', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }"
      />
      <MaplibreSwipe v-if="active">
        <MaplibreTiandituLayer layer="img" annotation />
      </MaplibreSwipe>
    </MaplibreMap>
    <UButton
      class="absolute left-2 top-2 z-10"
      size="sm"
      :icon="active ? 'i-lucide-x' : 'i-lucide-columns-2'"
      :variant="active ? 'soft' : 'solid'"
      @click="active = !active"
    >
      {{ active ? '关闭卷帘' : '卷帘对比' }}
    </UButton>
  </div>
</template>
