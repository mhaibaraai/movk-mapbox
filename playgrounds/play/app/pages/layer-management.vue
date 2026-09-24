<script setup lang="ts">
import type { FeatureCollection } from 'geojson'
import type { LayerSpecification } from 'maplibre-gl'
import type { BasemapItem } from '#maplibre/types'
import { tiandituStyle } from '#maplibre/utils/tianditu'

const mapId = 'layer-management-demo'

const basemaps: BasemapItem[] = [
  { label: 'OpenFreeMap Liberty', style: 'https://tiles.openfreemap.org/styles/liberty' },
  { label: 'OpenFreeMap Positron', style: 'https://tiles.openfreemap.org/styles/positron' },
  { label: 'OpenFreeMap Dark', style: 'https://tiles.openfreemap.org/styles/dark' },
  { label: '天地图 影像', style: tiandituStyle('img', { annotation: true }) },
  { label: '天地图 矢量', style: tiandituStyle('vec', { annotation: true }) }
]
const style = shallowRef(basemaps[0]!.style)

const schools: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { kind: '小学' }, geometry: { type: 'Point', coordinates: [116.38, 39.92] } },
    { type: 'Feature', properties: { kind: '中学' }, geometry: { type: 'Point', coordinates: [116.42, 39.9] } },
    { type: 'Feature', properties: { kind: '大学' }, geometry: { type: 'Point', coordinates: [116.35, 39.96] } }
  ]
}

const districts: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { pop: 60 }, geometry: { type: 'Polygon', coordinates: [[[116.34, 39.88], [116.38, 39.88], [116.38, 39.91], [116.34, 39.91], [116.34, 39.88]]] } },
    { type: 'Feature', properties: { pop: 240 }, geometry: { type: 'Polygon', coordinates: [[[116.39, 39.88], [116.43, 39.88], [116.43, 39.91], [116.39, 39.91], [116.39, 39.88]]] } },
    { type: 'Feature', properties: { pop: 800 }, geometry: { type: 'Polygon', coordinates: [[[116.44, 39.88], [116.48, 39.88], [116.48, 39.91], [116.44, 39.91], [116.44, 39.88]]] } }
  ]
}

const isLabel = (layer: LayerSpecification) => layer.type === 'symbol'
const isRoad = (layer: LayerSpecification) => 'source-layer' in layer && layer['source-layer'] === 'transportation'

const tree = useLayerTree({ mapId })
</script>

<template>
  <MapShowcase
    title="图层管理"
    description="MaplibreLayerGroup 是唯一数据源：图层控件、图例与右侧 useLayerTree 侧栏读写同一份 v-model；底图切换后业务图层与底图图层（注记、道路）状态保留。"
  >
    <MaplibreMap :map-id="mapId" :options="{ style, center: [116.41, 39.91], zoom: 11.5 }">
      <MaplibreLayerGroup title="人口片区" :opacity="0.7">
        <MaplibreLayer
          layer-id="lm-districts"
          type="fill"
          :source="{ type: 'geojson', data: districts }"
          :paint="{ 'fill-color': ['step', ['get', 'pop'], '#fde68a', 100, '#f59e0b', 500, '#b45309'], 'fill-opacity': 0.8 }"
        />
      </MaplibreLayerGroup>
      <MaplibreLayerGroup title="学校">
        <MaplibreLayer
          layer-id="lm-schools"
          type="circle"
          :source="{ type: 'geojson', data: schools }"
          :paint="{ 'circle-radius': 8, 'circle-color': ['match', ['get', 'kind'], '小学', '#22c55e', '中学', '#3b82f6', '大学', '#a855f7', '#999'], 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }"
        />
      </MaplibreLayerGroup>
      <MaplibreLayerGroup title="底图注记" :style-layers="isLabel" :legend="[]" />
      <MaplibreLayerGroup title="底图道路" :style-layers="isRoad" :legend="[]" />

      <MaplibreBasemapControl v-model="style" :items="basemaps" position="top-right" />
      <MaplibreLayerControl position="top-left" />
      <MaplibreLegend position="bottom-left" />
      <MaplibreNavigationControl position="top-right" />
    </MaplibreMap>

    <template #aside>
      <div class="flex flex-col gap-3 rounded-lg border border-default bg-default p-3">
        <p class="text-xs font-medium uppercase text-dimmed">
          useLayerTree 侧栏
        </p>
        <div v-for="item in tree" :key="item.id" class="flex flex-col gap-1">
          <USwitch :model-value="item.visible" :label="item.title" @update:model-value="item.setVisible($event)" />
          <USlider
            :model-value="item.opacity"
            :min="0"
            :max="1"
            :step="0.05"
            size="sm"
            :disabled="!item.visible"
            @update:model-value="item.setOpacity($event ?? 1)"
          />
        </div>
      </div>
    </template>
  </MapShowcase>
</template>
