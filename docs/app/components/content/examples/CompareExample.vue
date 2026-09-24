<script setup lang="ts">
const position = ref(0.5)
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreCompare v-model:position="position">
      <template #before>
        <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 11 }" />
      </template>
      <template #after>
        <MaplibreMap :options="{ center: [116.397, 39.908], zoom: 11 }">
          <MaplibreTiandituLayer layer="img" annotation />
        </MaplibreMap>
      </template>
    </MaplibreCompare>
    <UBadge class="absolute left-2 top-2 z-10" color="neutral" variant="subtle">
      {{ Math.round(position * 100) }}%
    </UBadge>
  </div>
</template>
