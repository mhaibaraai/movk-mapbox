<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

const position = ref<LngLatLike>([116.397, 39.908])
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 12 }">
      <!-- 无插槽时使用 maplibre 默认水滴标记 -->
      <MaplibreMarker v-model:lnglat="position" />
    </MaplibreMap>
  </div>
</template>
