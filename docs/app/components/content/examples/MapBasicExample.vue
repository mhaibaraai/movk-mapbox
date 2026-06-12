<script setup lang="ts">
const center = ref<[number, number]>([116.397, 39.908])
const zoom = ref(9)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      v-model:center="center"
      v-model:zoom="zoom"
      :options="{ style: 'mapbox://styles/mapbox/streets-v12' }"
    >
      <MapboxNavigationControl position="top-right" />
    </MapboxMap>
  </div>
</template>
