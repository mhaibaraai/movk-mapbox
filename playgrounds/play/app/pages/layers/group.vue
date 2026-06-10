<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const visible = ref(true)

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'Polygon',
          coordinates: [[
            [116.36, 39.88],
            [116.45, 39.88],
            [116.46, 39.95],
            [116.37, 39.95],
            [116.36, 39.88]
          ]]
        }
      }
    ]
  }
}
</script>

<template>
  <MapShowcase
    title="LayerGroup 图层组"
    description="MapboxLayerGroup 统一子图层显隐与插入锚点：开关一次切换组内填充/描边/顶点三层。"
  >
    <template #toolbar>
      <USwitch v-model="visible" label="显示图层组" />
    </template>

    <DemoMap :center="[116.41, 39.91]" :zoom="11">
      <MapboxSource source-id="group-area" :source="source">
        <MapboxLayerGroup :visible="visible">
          <MapboxLayer layer-id="group-fill" type="fill" source="group-area" :paint="{ 'fill-color': '#10b981', 'fill-opacity': 0.35 }" />
          <MapboxLayer layer-id="group-outline" type="line" source="group-area" :paint="{ 'line-color': '#047857', 'line-width': 2 }" />
          <MapboxLayer layer-id="group-points" type="circle" source="group-area" :paint="{ 'circle-color': '#047857', 'circle-radius': 5 }" />
        </MapboxLayerGroup>
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
