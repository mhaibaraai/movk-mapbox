<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const mapId = 'use-mapbox-image-demo'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } }
  ]
}

const { loaded } = useMapboxImage('demo-cat', 'https://docs.mapbox.com/mapbox-gl-js/assets/cat.png', { mapId })
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :map-id="mapId" :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 13 }">
      <MapboxLayer
        v-if="loaded"
        layer-id="cats"
        type="symbol"
        :source="{ type: 'geojson', data }"
        :layout="{ 'icon-image': 'demo-cat', 'icon-size': 0.25, 'icon-allow-overlap': true }"
      />
    </MapboxMap>
    <div class="absolute left-2 top-2 z-10 rounded bg-default/90 px-2 py-1 text-xs text-default ring ring-default">
      图片加载：{{ loaded ? '完成' : '加载中…' }}
    </div>
  </div>
</template>
