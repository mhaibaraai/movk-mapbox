<script setup lang="ts">
const mapId = 'use-mapbox-demo'

const cities: Record<string, [number, number]> = {
  北京: [116.39, 39.91],
  上海: [121.47, 31.23],
  广州: [113.26, 23.13]
}

// 按钮位于 <MapboxMap> 子树之外，经 useMapbox(id) 逃生口跨树访问已挂载的地图
function flyTo(center: [number, number]) {
  useMapbox(mapId)?.whenLoaded().then(map => map.flyTo({ center, zoom: 10 }))
}
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :map-id="mapId" :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 9 }" />
    <div class="absolute left-2 top-2 z-10 flex gap-1">
      <UButton v-for="(center, name) in cities" :key="name" size="sm" @click="flyTo(center)">
        {{ name }}
      </UButton>
    </div>
  </div>
</template>
