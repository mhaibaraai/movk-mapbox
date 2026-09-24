<script setup lang="ts">
const position = ref(0.5)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 11 }">
      <MaplibreNavigationControl position="top-right" />
      <MaplibreScaleControl position="bottom-left" />
      <MaplibreSwipe v-model:position="position">
        <MaplibreTiandituLayer layer="img" annotation />
      </MaplibreSwipe>
    </MaplibreMap>
  </div>
</template>
