<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const width = ref(4)

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [
        [116.39, 39.91],
        [116.42, 39.93],
        [116.46, 39.9],
        [116.48, 39.95]
      ]
    }
  }
}

const paint = computed(() => ({
  'line-color': '#f59e0b',
  'line-width': width.value
}))
</script>

<template>
  <MapShowcase
    title="Line 线图层"
    description="line 类型配合 layout 圆角端点；拖动滑块实时调整线宽。"
  >
    <template #toolbar>
      <USlider v-model="width" :min="1" :max="12" class="w-32" />
    </template>

    <DemoMap :center="[116.43, 39.92]" :zoom="12">
      <MapboxSource source-id="route" :source="source">
        <MapboxLayer
          layer-id="route-line"
          type="line"
          source="route"
          :layout="{ 'line-cap': 'round', 'line-join': 'round' }"
          :paint="paint"
        />
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
