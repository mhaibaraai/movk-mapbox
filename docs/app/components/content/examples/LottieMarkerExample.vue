<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'
import animationData from '~/assets/lottie/marker-pulse.json'

const position = ref<LngLatLike>([116.397, 39.908])
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 12 }">
      <MapboxLottieMarker
        v-model:lnglat="position"
        :animation-data="animationData"
        :width="80"
        :height="80"
      />
    </MapboxMap>
  </div>
</template>
