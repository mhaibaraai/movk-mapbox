<script setup lang="ts">
interface Poi {
  id: string
  lnglat: [number, number]
  name: string
  type: string
}

const points: Poi[] = [
  { id: 'tam', lnglat: [116.397, 39.908], name: '天安门', type: '地标' },
  { id: 'gm', lnglat: [116.461, 39.909], name: '国贸', type: '商圈' },
  { id: 'zgc', lnglat: [116.316, 39.983], name: '中关村', type: '科技园' }
]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.94], zoom: 10.6 }">
      <MapboxMarker
        v-for="point in points"
        :key="point.id"
        :lnglat="point.lnglat"
        :open="true"
        :popup-options="{ offset: 18, closeButton: false, closeOnClick: false }"
      >
        <div class="size-3 cursor-pointer rounded-full border-2 border-white bg-primary shadow" />
        <template #popup>
          <div class="px-1 text-sm">
            <span class="font-semibold">{{ point.name }}</span>
            <span class="text-muted"> · {{ point.type }}</span>
          </div>
        </template>
      </MapboxMarker>
    </MapboxMap>
  </div>
</template>
