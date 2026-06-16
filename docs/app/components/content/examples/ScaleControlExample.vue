<script setup lang="ts">
withDefaults(defineProps<{ unit?: 'metric' | 'imperial' | 'nautical' }>(), {
  unit: 'metric'
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 10 }">
      <MapboxScaleControl position="bottom-left" :options="{ unit, maxWidth: 120 }" />
    </MapboxMap>
  </div>
</template>
