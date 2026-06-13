<script setup lang="ts">
withDefaults(defineProps<{ exaggeration?: number }>(), {
  exaggeration: 1.5
})
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{
        style: 'mapbox://styles/mapbox/satellite-streets-v12',
        center: [86.925, 27.989],
        zoom: 12,
        pitch: 76,
        bearing: 40
      }"
    >
      <MapboxTerrain :exaggeration="exaggeration" />
    </MapboxMap>
  </div>
</template>
