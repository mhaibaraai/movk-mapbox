<script setup lang="ts">
withDefaults(defineProps<{ unit?: 'metric' | 'imperial' | 'nautical' }>(), {
  unit: 'metric'
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.39, 39.91], zoom: 10 }">
      <MaplibreScaleControl position="bottom-left" :options="{ unit, maxWidth: 120 }" />
    </MaplibreMap>
  </div>
</template>
