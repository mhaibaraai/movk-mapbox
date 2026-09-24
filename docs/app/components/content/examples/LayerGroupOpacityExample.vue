<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const visible = ref(true)
const opacity = ref(1)

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[116.36, 39.95], [116.44, 39.95], [116.44, 39.89], [116.36, 39.89], [116.36, 39.95]]] } }]
}
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.4, 39.92], zoom: 11 }">
      <!-- v-model 双向绑定：外部按钮与图层控件写回同一份状态 -->
      <MaplibreLayerGroup v-model:visible="visible" v-model:opacity="opacity" title="规划片区">
        <MaplibreLayer layer-id="opacity-fill" type="fill" :source="{ type: 'geojson', data }" :paint="{ 'fill-color': '#f43f5e', 'fill-opacity': 0.5 }" />
        <MaplibreLayer layer-id="opacity-line" type="line" :source="{ type: 'geojson', data }" :paint="{ 'line-color': '#f43f5e', 'line-width': 3 }" />
      </MaplibreLayerGroup>
      <MaplibreLayerControl position="top-right" />
    </MaplibreMap>
    <div class="absolute left-3 top-3 z-10 flex w-48 flex-col gap-2 rounded-md bg-default/90 p-2 ring ring-default">
      <USwitch v-model="visible" label="显示" size="sm" />
      <USlider
        v-model="opacity"
        :min="0"
        :max="1"
        :step="0.05"
        size="sm"
        :disabled="!visible"
      />
    </div>
  </div>
</template>
