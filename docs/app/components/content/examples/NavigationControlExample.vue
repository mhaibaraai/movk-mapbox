<script setup lang="ts">
import type { ControlPosition } from 'maplibre-gl'

withDefaults(defineProps<{ position?: ControlPosition }>(), {
  position: 'top-right'
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.39, 39.91], zoom: 10 }">
      <MaplibreNavigationControl :position="position" />
    </MaplibreMap>
  </div>
</template>
