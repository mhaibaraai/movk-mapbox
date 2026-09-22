<script setup lang="ts">
import type { VectorSourceSpecification } from '@maplibre/maplibre-gl-style-spec'

// OpenFreeMap 矢量瓦片的 building 子图层，按 render_height 字段拉伸为 3D
const source: VectorSourceSpecification = {
  type: 'vector',
  url: 'https://tiles.openfreemap.org/planet'
}
</script>

<template>
  <MapShowcase
    title="FillExtrusion 3D 建筑"
    description="fill-extrusion 类型按属性字段拉伸高度，配合俯仰角呈现 3D 建筑。"
  >
    <DemoMap
      map-style="https://tiles.openfreemap.org/styles/positron"
      :center="[116.39, 39.91]"
      :zoom="15.5"
      :pitch="55"
      :bearing="-20"
    >
      <MaplibreSource source-id="buildings" :source="source">
        <MaplibreLayer
          layer-id="3d-buildings"
          type="fill-extrusion"
          source="buildings"
          source-layer="building"
          :minzoom="14"
          :paint="{
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': ['get', 'render_height'],
            'fill-extrusion-base': ['get', 'render_min_height'],
            'fill-extrusion-opacity': 0.85
          }"
        />
      </MaplibreSource>
    </DemoMap>
  </MapShowcase>
</template>
