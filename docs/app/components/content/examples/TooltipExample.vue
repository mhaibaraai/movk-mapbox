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
      <!-- 悬浮 poi 图层要素时跟随显示，slot 暴露命中要素 -->
      <MapboxTooltip layer-id="poi">
        <template #default="{ feature }">
          <div v-if="feature" class="px-1 text-sm">
            <span class="font-semibold">{{ feature.properties?.name }}</span>
            <span class="text-muted"> · {{ feature.properties?.type }}</span>
          </div>
        </template>
      </MapboxTooltip>
    </MapboxMap>
  </div>
</template>
