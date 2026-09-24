<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const mapId = 'use-layer-tree-demo'
// 地图子树外通过 mapId 读取图层树
const tree = useLayerTree({ mapId })

const zone: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[[116.36, 39.95], [116.44, 39.95], [116.44, 39.89], [116.36, 39.89], [116.36, 39.95]]] } }]
}
const river: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [[116.33, 39.93], [116.39, 39.91], [116.47, 39.92]] } }]
}
</script>

<template>
  <div class="grid h-115 w-full grid-cols-[1fr_12rem] overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :map-id="mapId" :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.4, 39.92], zoom: 11 }">
      <MaplibreLayerGroup title="规划片区">
        <MaplibreLayer layer-id="tree-zone" type="fill" :source="{ type: 'geojson', data: zone }" :paint="{ 'fill-color': '#f59e0b', 'fill-opacity': 0.4 }" />
      </MaplibreLayerGroup>
      <MaplibreLayerGroup title="河流">
        <MaplibreLayer layer-id="tree-river" type="line" :source="{ type: 'geojson', data: river }" :paint="{ 'line-color': '#0ea5e9', 'line-width': 4 }" />
      </MaplibreLayerGroup>
    </MaplibreMap>
    <aside class="flex flex-col gap-3 border-l border-default p-3">
      <div v-for="item in tree" :key="item.id" class="flex flex-col gap-1">
        <USwitch :model-value="item.visible" :label="item.title" size="sm" @update:model-value="item.setVisible($event)" />
        <USlider
          :model-value="item.opacity"
          :min="0"
          :max="1"
          :step="0.05"
          size="sm"
          :disabled="!item.visible"
          @update:model-value="item.setOpacity($event ?? 1)"
        />
      </div>
    </aside>
  </div>
</template>
