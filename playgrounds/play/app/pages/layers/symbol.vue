<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { title: '天安门' }, geometry: { type: 'Point', coordinates: [116.397, 39.909] } },
      { type: 'Feature', properties: { title: '颐和园' }, geometry: { type: 'Point', coordinates: [116.275, 39.999] } },
      { type: 'Feature', properties: { title: '鸟巢' }, geometry: { type: 'Point', coordinates: [116.397, 39.993] } }
    ]
  }
}
</script>

<template>
  <MapShowcase
    title="Symbol 符号图层"
    description="symbol 类型用内置字体渲染文字标注，layout 控制文字字段与排布。"
  >
    <DemoMap :center="[116.35, 39.96]" :zoom="10">
      <MapboxSource source-id="poi" :source="source">
        <MapboxLayer
          layer-id="poi-symbol"
          type="symbol"
          source="poi"
          :layout="{
            'text-field': ['get', 'title'],
            'text-size': 14,
            'text-offset': [0, 1.2],
            'text-anchor': 'top'
          }"
          :paint="{ 'text-color': '#dc2626', 'text-halo-color': '#fff', 'text-halo-width': 1.5 }"
        />
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
