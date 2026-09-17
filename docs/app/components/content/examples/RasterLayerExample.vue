<script setup lang="ts">
const tiles = ['https://tile.openstreetmap.org/{z}/{x}/{y}.png']
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <!-- 省略 style 即空白样式，仅叠加外部栅格瓦片 -->
    <MaplibreMap :options="{ center: [116.4, 39.9], zoom: 9 }">
      <MaplibreRasterLayer
        :tiles="tiles"
        :tile-size="256"
        attribution="© OpenStreetMap contributors"
      />
    </MaplibreMap>
  </div>
</template>
