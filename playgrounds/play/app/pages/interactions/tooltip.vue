<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { title: '天安门', kind: '地标' }, geometry: { type: 'Point', coordinates: [116.397, 39.909] } },
      { type: 'Feature', properties: { title: '颐和园', kind: '园林' }, geometry: { type: 'Point', coordinates: [116.275, 39.999] } },
      { type: 'Feature', properties: { title: '鸟巢', kind: '场馆' }, geometry: { type: 'Point', coordinates: [116.397, 39.993] } }
    ]
  }
}
</script>

<template>
  <MapShowcase
    title="Tooltip 悬浮提示"
    description="MapboxTooltip 是 Popup 的 hover 模式：悬浮目标图层要素时跟随显示，作用域插槽拿到当前要素。"
  >
    <DemoMap :center="[116.35, 39.96]" :zoom="10.5">
      <MapboxSource source-id="poi" :source="source">
        <MapboxLayer
          layer-id="poi-circle"
          type="circle"
          source="poi"
          :paint="{ 'circle-color': '#e11d48', 'circle-radius': 8, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }"
        />
      </MapboxSource>
      <MapboxTooltip layer-id="poi-circle" :options="{ offset: 12 }">
        <template #default="{ feature }">
          <div class="px-1 py-0.5 text-sm">
            <p class="font-semibold">
              {{ feature?.properties?.title }}
            </p>
            <p class="text-xs text-gray-500">
              {{ feature?.properties?.kind }}
            </p>
          </div>
        </template>
      </MapboxTooltip>
    </DemoMap>
  </MapShowcase>
</template>
