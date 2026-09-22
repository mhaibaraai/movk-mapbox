<script setup lang="ts">
const center = ref<[number, number]>([116.397, 39.908])
const zoom = ref(9)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap
      v-model:center="center"
      v-model:zoom="zoom"
      :options="{ style: 'https://tiles.openfreemap.org/styles/liberty' }"
    >
      <MaplibreNavigationControl position="top-right" />
    </MaplibreMap>
  </div>
</template>
