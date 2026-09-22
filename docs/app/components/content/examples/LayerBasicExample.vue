<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [[[116.36, 39.95], [116.44, 39.95], [116.44, 39.89], [116.36, 39.89], [116.36, 39.95]]]
    }
  }]
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.4, 39.92], zoom: 11 }">
      <!-- 同一内联源派生 fill 与 line 两层，beforeId 控制描边压在填充之上 -->
      <MaplibreLayer
        layer-id="zone-fill"
        type="fill"
        :source="{ type: 'geojson', data }"
        :paint="{ 'fill-color': '#f43f5e', 'fill-opacity': 0.3 }"
      />
      <MaplibreLayer
        layer-id="zone-line"
        type="line"
        :source="{ type: 'geojson', data }"
        :paint="{ 'line-color': '#f43f5e', 'line-width': 2 }"
      />
    </MaplibreMap>
  </div>
</template>
