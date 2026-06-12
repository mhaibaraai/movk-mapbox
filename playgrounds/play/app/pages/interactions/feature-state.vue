<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'

// generateId 为要素生成数值 id，feature-state 必需
const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  generateId: true,
  data: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { name: '东城' }, geometry: { type: 'Polygon', coordinates: [[[116.40, 39.88], [116.45, 39.88], [116.45, 39.94], [116.40, 39.94], [116.40, 39.88]]] } },
      { type: 'Feature', properties: { name: '西城' }, geometry: { type: 'Polygon', coordinates: [[[116.34, 39.88], [116.39, 39.88], [116.39, 39.94], [116.34, 39.94], [116.34, 39.88]]] } },
      { type: 'Feature', properties: { name: '朝阳' }, geometry: { type: 'Polygon', coordinates: [[[116.46, 39.88], [116.52, 39.88], [116.52, 39.96], [116.46, 39.96], [116.46, 39.88]]] } }
    ]
  }
}

// hover 加深、selected 变色，全部由 feature-state 表达式驱动，无需重设 data
const fillPaint = {
  'fill-color': ['case', ['boolean', ['feature-state', 'selected'], false], '#f59e0b', '#3b82f6'],
  'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.65, 0.35]
}

const { hovered, selected, clearSelection } = useFeatureState('district-fill', { mapId: 'feature-state-demo' })

const state = computed(() => ({
  hovered: hovered.value?.properties?.name ?? null,
  selected: selected.value?.properties?.name ?? null
}))
</script>

<template>
  <MapShowcase
    title="useFeatureState 悬浮/选中"
    description="feature-state 驱动 hover 高亮与点击选中，paint 表达式响应状态，零数据重写。"
    :state="state"
  >
    <template #toolbar>
      <UButton size="sm" variant="soft" :disabled="!selected" @click="clearSelection">
        清除选中
      </UButton>
    </template>

    <DemoMap map-id="feature-state-demo" :center="[116.43, 39.92]" :zoom="10.5">
      <MapboxSource source-id="districts" :source="source">
        <MapboxLayer layer-id="district-fill" type="fill" source="districts" :paint="fillPaint" />
        <MapboxLayer layer-id="district-line" type="line" source="districts" :paint="{ 'line-color': '#1d4ed8', 'line-width': 1.5 }" />
      </MapboxSource>
    </DemoMap>
  </MapShowcase>
</template>
