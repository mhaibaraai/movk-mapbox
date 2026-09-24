<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const pois: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { kind: 'school' }, geometry: { type: 'Point', coordinates: [116.38, 39.92] } },
    { type: 'Feature', properties: { kind: 'hospital' }, geometry: { type: 'Point', coordinates: [116.42, 39.9] } }
  ]
}

const districts: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { pop: 60 }, geometry: { type: 'Polygon', coordinates: [[[116.34, 39.88], [116.38, 39.88], [116.38, 39.91], [116.34, 39.91], [116.34, 39.88]]] } },
    { type: 'Feature', properties: { pop: 800 }, geometry: { type: 'Polygon', coordinates: [[[116.44, 39.88], [116.48, 39.88], [116.48, 39.91], [116.44, 39.91], [116.44, 39.88]]] } }
  ]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.41, 39.91], zoom: 11.5 }">
      <!-- step 表达式推导为分级区间 -->
      <MaplibreLayerGroup title="人口密度">
        <MaplibreLayer
          layer-id="legend-districts"
          type="fill"
          :source="{ type: 'geojson', data: districts }"
          :paint="{ 'fill-color': ['step', ['get', 'pop'], '#fde68a', 100, '#f59e0b', 500, '#b45309'], 'fill-opacity': 0.6 }"
        />
      </MaplibreLayerGroup>
      <!-- match 表达式推导为分类项；legend prop 可改写标签 -->
      <MaplibreLayerGroup
        title="设施"
        :legend="[
          { label: '学校', type: 'circle', color: '#22c55e' },
          { label: '医院', type: 'circle', color: '#ef4444' }
        ]"
      >
        <MaplibreLayer
          layer-id="legend-pois"
          type="circle"
          :source="{ type: 'geojson', data: pois }"
          :paint="{ 'circle-radius': 8, 'circle-color': ['match', ['get', 'kind'], 'school', '#22c55e', 'hospital', '#ef4444', '#999'], 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }"
        />
      </MaplibreLayerGroup>
      <MaplibreLayerControl position="top-left" />
      <MaplibreLegend position="bottom-left" />
    </MaplibreMap>
  </div>
</template>
