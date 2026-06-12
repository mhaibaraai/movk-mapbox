<script setup lang="ts">
import type { FeatureCollection } from 'geojson'
import type { MapEventOf } from 'mapbox-gl'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: '天安门' }, geometry: { type: 'Point', coordinates: [116.397, 39.908] } },
    { type: 'Feature', properties: { name: '国贸' }, geometry: { type: 'Point', coordinates: [116.461, 39.909] } },
    { type: 'Feature', properties: { name: '中关村' }, geometry: { type: 'Point', coordinates: [116.316, 39.983] } }
  ]
}

const selected = ref<string | null>(null)

// 图层 click 事件携带命中要素，从 properties 读取业务字段
function onClick(event: MapEventOf<'click'>) {
  selected.value = (event.features?.[0]?.properties?.name as string) ?? null
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.93], zoom: 11 }">
      <MapboxLayer
        layer-id="poi"
        type="circle"
        :source="{ type: 'geojson', data }"
        :paint="{ 'circle-radius': 9, 'circle-color': '#f43f5e', 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }"
        @click="onClick"
      />
      <div class="absolute right-3 top-3 z-10 rounded-(--ui-radius) border border-default bg-default/80 px-3 py-1.5 text-sm backdrop-blur">
        {{ selected ? `已选中：${selected}` : '点击任意圆点' }}
      </div>
    </MapboxMap>
  </div>
</template>
