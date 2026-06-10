<script setup lang="ts">
import type { VectorSourceSpecification } from 'mapbox-gl'

// 复用 Mapbox Streets 的 building 子图层，按 height 字段拉伸为 3D
const source: VectorSourceSpecification = {
  type: 'vector',
  url: 'mapbox://mapbox.mapbox-streets-v8'
}
</script>

<template>
  <MapShowcase
    title="FillExtrusion 3D 建筑"
    description="fill-extrusion 类型按属性字段拉伸高度，配合俯仰角呈现 3D 建筑。"
  >
    <MapboxMap
      :options="{
        style: 'mapbox://styles/mapbox/light-v11',
        center: [116.39, 39.91],
        zoom: 15.5,
        pitch: 55,
        bearing: -20
      }"
    >
      <MapboxSource source-id="composite" :source="source">
        <MapboxLayer
          layer-id="3d-buildings"
          type="fill-extrusion"
          source="composite"
          source-layer="building"
          :minzoom="14"
          :filter="['==', 'extrude', 'true']"
          :paint="{
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.85
          }"
        />
      </MapboxSource>
    </MapboxMap>
  </MapShowcase>
</template>
