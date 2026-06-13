<script setup lang="ts">
import type { ControlPosition } from 'mapbox-gl'

withDefaults(defineProps<{ position?: ControlPosition }>(), {
  position: 'top-right'
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 10 }">
      <MapboxNavigationControl :position="position" />
    </MapboxMap>
  </div>
</template>
