<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const visible = ref(true)

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
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.4, 39.92], zoom: 11 }">
      <div class="absolute left-3 top-3 z-10">
        <UButton size="xs" color="neutral" variant="solid" @click="visible = !visible">
          {{ visible ? 'Hide group' : 'Show group' }}
        </UButton>
      </div>
      <!-- 组级 visible 统一开关子图层，无需逐层设置 layout.visibility -->
      <MapboxLayerGroup :visible="visible">
        <MapboxLayer
          layer-id="zone-fill"
          type="fill"
          :source="{ type: 'geojson', data }"
          :paint="{ 'fill-color': '#f43f5e', 'fill-opacity': 0.3 }"
        />
        <MapboxLayer
          layer-id="zone-line"
          type="line"
          :source="{ type: 'geojson', data }"
          :paint="{ 'line-color': '#f43f5e', 'line-width': 2 }"
        />
      </MapboxLayerGroup>
    </MapboxMap>
  </div>
</template>
