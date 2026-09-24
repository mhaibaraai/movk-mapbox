<script setup lang="ts">
import type { LayerSpecification } from 'maplibre-gl'

// 按图层特征匹配，而非写死 id：换一套样式同样适用
const isLabel = (layer: LayerSpecification) => layer.type === 'symbol'
const isRoad = (layer: LayerSpecification) => 'source-layer' in layer && layer['source-layer'] === 'transportation'
const isBuilding = (layer: LayerSpecification) => 'source-layer' in layer && layer['source-layer'] === 'building'
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 14 }">
      <MaplibreLayerGroup title="注记" :style-layers="isLabel" :legend="[]" />
      <MaplibreLayerGroup title="道路" :style-layers="isRoad" :legend="[]" />
      <MaplibreLayerGroup title="建筑" :style-layers="isBuilding" :legend="[]" />
      <MaplibreLayerControl position="top-left" />
    </MaplibreMap>
  </div>
</template>
