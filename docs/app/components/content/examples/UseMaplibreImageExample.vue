<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const mapId = 'use-maplibre-image-demo'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } }
  ]
}

const { loaded } = useMaplibreImage('demo-cat', 'https://upload.wikimedia.org/wikipedia/commons/7/7c/201408_cat.png', { mapId })
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :map-id="mapId" :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.397, 39.908], zoom: 13 }">
      <MaplibreLayer
        v-if="loaded"
        layer-id="cats"
        type="symbol"
        :source="{ type: 'geojson', data }"
        :layout="{ 'icon-image': 'demo-cat', 'icon-size': 0.25, 'icon-allow-overlap': true }"
      />
    </MaplibreMap>
    <div class="absolute left-2 top-2 z-10 rounded bg-default/90 px-2 py-1 text-xs text-default ring ring-default">
      图片加载：{{ loaded ? '完成' : '加载中…' }}
    </div>
  </div>
</template>
