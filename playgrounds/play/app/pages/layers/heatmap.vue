<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: Array.from({ length: 300 }, () => ({
      type: 'Feature',
      properties: {},
      geometry: { type: 'Point', coordinates: [116.2 + Math.random() * 0.5, 39.8 + Math.random() * 0.3] }
    }))
  }
}
</script>

<template>
  <MapShowcase
    title="Heatmap 热力图层"
    description="heatmap 类型基于点密度渲染热力，paint 表达式控制权重、半径与配色渐变。"
  >
    <DemoMap :center="[116.41, 39.93]" :zoom="10">
      <MapboxSource source-id="heat" :source="source">
        <MapboxLayer
          layer-id="heat-layer"
          type="heatmap"
          source="heat"
          :paint="{
            'heatmap-radius': 24,
            'heatmap-intensity': 1,
            'heatmap-opacity': 0.85,
            'heatmap-color': [
              'interpolate', ['linear'], ['heatmap-density'],
              0, 'rgba(0,0,255,0)',
              0.4, 'royalblue',
              0.7, 'yellow',
              1, 'red'
            ]
          }"
        />
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
