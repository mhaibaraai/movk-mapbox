<script setup lang="ts">
const enabled = ref(true)

useMapSync(['sync-demo-left', 'sync-demo-right'], { enabled })
</script>

<template>
  <div class="relative grid h-115 w-full grid-cols-2 gap-px overflow-hidden rounded-(--ui-radius) border border-default bg-(--ui-border)">
    <MaplibreMap map-id="sync-demo-left" :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 11 }" />
    <MaplibreMap map-id="sync-demo-right" :options="{ center: [116.397, 39.908], zoom: 11 }">
      <MaplibreTiandituLayer layer="img" annotation />
    </MaplibreMap>
    <div class="absolute left-2 top-2 z-10 rounded-md bg-default/90 px-2 py-1 ring ring-default">
      <USwitch v-model="enabled" label="联动" size="sm" />
    </div>
  </div>
</template>
