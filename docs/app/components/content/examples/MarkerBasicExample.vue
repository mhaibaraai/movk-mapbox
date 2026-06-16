<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

const position = ref<LngLatLike>([116.397, 39.908])
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/streets-v12', center: [116.397, 39.908], zoom: 12 }">
      <!-- 无插槽时使用 mapbox 默认水滴标记 -->
      <MapboxMarker v-model:lnglat="position" />
    </MapboxMap>
  </div>
</template>
