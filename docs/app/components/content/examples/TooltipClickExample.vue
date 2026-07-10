<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: '天安门', type: '地标' }, geometry: { type: 'Point', coordinates: [116.397, 39.908] } },
    { type: 'Feature', properties: { name: '国贸', type: '商圈' }, geometry: { type: 'Point', coordinates: [116.461, 39.909] } },
    { type: 'Feature', properties: { name: '中关村', type: '科技园' }, geometry: { type: 'Point', coordinates: [116.316, 39.983] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.93], zoom: 11 }">
      <MapboxLayer
        layer-id="poi"
        type="circle"
        :source="{ type: 'geojson', data }"
        :paint="{ 'circle-radius': 9, 'circle-color': '#f43f5e', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }"
      />
      <MapboxTooltip layer-id="poi" trigger="click">
        <template #default="{ feature, close }">
          <div v-if="feature" class="w-44 px-1 py-0.5">
            <p class="font-semibold">
              {{ feature.properties?.name }}
            </p>
            <p class="mt-0.5 text-sm text-muted">
              {{ feature.properties?.type }}
            </p>
            <UButton class="mt-2" size="xs" color="neutral" variant="subtle" @click="close">
              收起
            </UButton>
          </div>
        </template>
      </MapboxTooltip>
    </MapboxMap>
  </div>
</template>
