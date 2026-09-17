<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'
import animationData from '~/assets/lottie/marker-pulse.json'

const position = ref<LngLatLike>([116.397, 39.908])
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.397, 39.908], zoom: 12 }">
      <MaplibreLottieMarker
        v-model:lnglat="position"
        :animation-data="animationData"
        :width="80"
        :height="80"
      />
    </MaplibreMap>
  </div>
</template>
