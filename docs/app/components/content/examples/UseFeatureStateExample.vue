<script setup lang="ts">
import type { GeoJSONFeature } from 'mapbox-gl'
import type { Feature, FeatureCollection } from 'geojson'

const mapId = 'use-feature-state-demo'

function block(name: string, lng: number, lat: number): Feature {
  const d = 0.04
  return {
    type: 'Feature',
    properties: { name },
    geometry: { type: 'Polygon', coordinates: [[[lng, lat], [lng + d, lat], [lng + d, lat + d], [lng, lat + d], [lng, lat]]] }
  }
}

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [block('A 区', 116.34, 39.90), block('B 区', 116.40, 39.90), block('C 区', 116.46, 39.90)]
}

const { hovered, selected, clearSelection } = useFeatureState('blocks-fill', { mapId })

const nameOf = (feature: GeoJSONFeature | undefined) => (feature?.properties?.name as string) ?? '无'
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :map-id="mapId" :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.42, 39.92], zoom: 10.5 }">
      <MapboxSource source-id="blocks" :source="{ type: 'geojson', data, generateId: true }">
        <MapboxLayer
          layer-id="blocks-fill"
          type="fill"
          source="blocks"
          :paint="{
            'fill-color': '#3b82f6',
            'fill-opacity': [
              'case',
              ['boolean', ['feature-state', 'selected'], false], 0.8,
              ['boolean', ['feature-state', 'hover'], false], 0.5,
              0.2
            ]
          }"
        />
        <MapboxLayer layer-id="blocks-line" type="line" source="blocks" :paint="{ 'line-color': '#1d4ed8', 'line-width': 1 }" />
      </MapboxSource>
    </MapboxMap>
    <div class="absolute left-2 top-2 z-10 flex items-center gap-2 rounded bg-default/90 px-3 py-1.5 text-xs text-default ring ring-default">
      <span>悬浮：{{ nameOf(hovered) }}</span>
      <span>选中：{{ nameOf(selected) }}</span>
      <UButton size="xs" variant="soft" @click="clearSelection">
        清除
      </UButton>
    </div>
  </div>
</template>
