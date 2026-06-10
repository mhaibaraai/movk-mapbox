<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.909] } },
      { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.45, 39.95] } }
    ]
  }
}

// 注册命名图片；setStyle 切换底图后自动补回
const { loaded } = useMapboxImage(
  'demo-cat',
  'https://docs.mapbox.com/mapbox-gl-js/assets/cat.png',
  { mapId: 'icons-demo' }
)
</script>

<template>
  <MapShowcase
    title="useMapboxImage 图标注册"
    description="加载远程图片注册为样式图片，symbol 图层经 icon-image 引用；切换底图后自动重注册。"
    :state="{ loaded }"
  >
    <DemoMap map-id="icons-demo" :center="[116.42, 39.93]" :zoom="11">
      <MapboxSource source-id="cats" :source="source">
        <MapboxLayer
          v-if="loaded"
          layer-id="cat-symbols"
          type="symbol"
          source="cats"
          :layout="{ 'icon-image': 'demo-cat', 'icon-size': 0.15, 'icon-allow-overlap': true }"
        />
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
