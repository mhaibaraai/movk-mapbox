<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

const position = ref<LngLatLike>([116.397, 39.908])
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 13 }">
      <MaplibreMarker :lnglat="position" :popup-options="{ offset: 20 }">
        <div class="flex size-8 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-primary text-white shadow-lg">
          <UIcon name="i-lucide-map-pin" class="size-4" />
        </div>
        <template #popup="{ close }">
          <div class="w-48 px-1 py-0.5">
            <p class="font-semibold">
              天安门
            </p>
            <p class="mt-0.5 text-sm text-muted">
              北京市东城区长安街
            </p>
            <UButton class="mt-2" size="xs" color="neutral" variant="subtle" @click="close">
              知道了
            </UButton>
          </div>
        </template>
      </MaplibreMarker>
    </MaplibreMap>
  </div>
</template>
