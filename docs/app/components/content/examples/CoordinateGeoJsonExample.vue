<script setup lang="ts">
import type { FeatureCollection } from 'geojson'
import { transformGeoJSON } from '@movk/mapbox/utils/coordinate'

// 高德导出的一段折线（GCJ02 坐标，叠在天地图上会偏移）
const raw: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [121.4737, 31.2304],
        [121.4800, 31.2330],
        [121.4860, 31.2352],
        [121.4920, 31.2360]
      ]
    }
  }]
}

// 整体纠偏为 WGS84 对齐天地图，返回新对象，不修改 raw
const fixed = transformGeoJSON(raw, 'GCJ02', 'WGS84')
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [121.484, 31.234], zoom: 14 }">
      <MapboxTiandituLayer layer="vec" annotation />
      <MapboxLayer
        layer-id="line-raw"
        type="line"
        :source="{ type: 'geojson', data: raw }"
        :paint="{ 'line-color': '#ef4444', 'line-width': 4 }"
      />
      <MapboxLayer
        layer-id="line-fixed"
        type="line"
        :source="{ type: 'geojson', data: fixed }"
        :paint="{ 'line-color': '#22c55e', 'line-width': 4 }"
      />
    </MapboxMap>
  </div>
</template>
