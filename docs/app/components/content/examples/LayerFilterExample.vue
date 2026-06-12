<script setup lang="ts">
import type { FeatureCollection } from 'geojson'
import type { FilterSpecification } from 'mapbox-gl'

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: Array.from({ length: 30 }, (_, i) => ({
    type: 'Feature',
    properties: { level: i % 3 },
    geometry: {
      type: 'Point',
      coordinates: [116.2 + ((i * 13) % 40) / 100, 39.8 + ((i * 29) % 25) / 100]
    }
  }))
}

const levels = [
  { label: 'All', value: -1 },
  { label: 'Level 0', value: 0 },
  { label: 'Level 1', value: 1 },
  { label: 'Level 2', value: 2 }
]
const active = ref(-1)

// filter 为表达式：仅渲染匹配要素，切换时即时生效（setFilter）
const filter = computed<FilterSpecification | undefined>(() =>
  active.value === -1 ? undefined : ['==', ['get', 'level'], active.value]
)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.4, 39.9], zoom: 10 }">
      <div class="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
        <UButton
          v-for="lv in levels"
          :key="lv.value"
          size="xs"
          :color="active === lv.value ? 'primary' : 'neutral'"
          variant="solid"
          @click="active = lv.value"
        >
          {{ lv.label }}
        </UButton>
      </div>
      <MapboxLayer
        layer-id="points"
        type="circle"
        :source="{ type: 'geojson', data }"
        :filter="filter"
        :paint="{
          'circle-radius': 7,
          'circle-color': ['match', ['get', 'level'], 0, '#3b82f6', 1, '#f59e0b', 2, '#ef4444', '#888'],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#fff'
        }"
      />
    </MapboxMap>
  </div>
</template>
