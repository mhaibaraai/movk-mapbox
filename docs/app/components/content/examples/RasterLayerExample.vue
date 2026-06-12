<script setup lang="ts">
const tiles = ['https://tile.openstreetmap.org/{z}/{x}/{y}.png']
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <!-- 空样式底图，仅叠加外部栅格瓦片 -->
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/empty-v9', center: [116.4, 39.9], zoom: 9 }">
      <MapboxRasterLayer
        :tiles="tiles"
        :tile-size="256"
        attribution="© OpenStreetMap contributors"
      />
    </MapboxMap>
  </div>
</template>
