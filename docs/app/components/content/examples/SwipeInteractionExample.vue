<script setup lang="ts">
import type { FeatureCollection } from 'geojson'
import type { MapLayerMouseEvent } from 'maplibre-gl'

const swipe = useTemplateRef<{ isPointRevealed: (point: { x: number, y: number }) => boolean }>('swipe')
const clicked = ref('')

const districts: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: { name: '东城片区' }, geometry: { type: 'Polygon', coordinates: [[[116.40, 39.88], [116.44, 39.88], [116.44, 39.93], [116.40, 39.93], [116.40, 39.88]]] } },
    { type: 'Feature', properties: { name: '西城片区' }, geometry: { type: 'Polygon', coordinates: [[[116.34, 39.88], [116.38, 39.88], [116.38, 39.93], [116.34, 39.93], [116.34, 39.88]]] } }
  ]
}

// 主图图层与对照图层重叠：被卷帘遮住的主图要素不响应点击
function onMainClick(event: MapLayerMouseEvent) {
  if (swipe.value?.isPointRevealed(event.point)) return
  clicked.value = `主图：${event.features?.[0]?.properties?.name}`
}

function onOverlayClick(event: MapLayerMouseEvent) {
  clicked.value = `对照图：${event.features?.[0]?.properties?.name}`
}
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.39, 39.905], zoom: 12 }">
      <MaplibreLayer
        layer-id="swipe-main-districts"
        type="fill"
        :source="{ type: 'geojson', data: districts }"
        :paint="{ 'fill-color': '#3b82f6', 'fill-opacity': 0.35 }"
        @click="onMainClick"
      />
      <MaplibreSwipe ref="swipe">
        <MaplibreTiandituLayer layer="img" />
        <MaplibreLayer
          layer-id="swipe-overlay-districts"
          type="fill"
          :source="{ type: 'geojson', data: districts }"
          :paint="{ 'fill-color': '#f59e0b', 'fill-opacity': 0.45 }"
          @click="onOverlayClick"
        />
        <MaplibreTooltip layer-id="swipe-overlay-districts">
          <template #default="{ feature }">
            {{ feature?.properties?.name }}（对照图）
          </template>
        </MaplibreTooltip>
      </MaplibreSwipe>
    </MaplibreMap>
    <UBadge v-if="clicked" class="absolute left-2 top-2 z-10" color="neutral" variant="subtle">
      {{ clicked }}
    </UBadge>
  </div>
</template>
