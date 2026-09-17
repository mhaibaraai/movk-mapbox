<script setup lang="ts">
interface Poi {
  id: string
  lnglat: [number, number]
  name: string
}

const points: Poi[] = [
  { id: 'tam', lnglat: [116.397, 39.908], name: '天安门' },
  { id: 'gm', lnglat: [116.461, 39.909], name: '国贸' },
  { id: 'zgc', lnglat: [116.316, 39.983], name: '中关村' }
]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.39, 39.94], zoom: 10.6 }">
      <MaplibrePopup
        v-for="point in points"
        :key="point.id"
        :lnglat="point.lnglat"
        :options="{ closeButton: false, closeOnClick: false, offset: 12 }"
      >
        <div class="px-1 text-sm font-semibold">
          {{ point.name }}
        </div>
      </MaplibrePopup>
    </MaplibreMap>
  </div>
</template>
