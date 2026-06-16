<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

const mapId = 'camera-demo'
const { flyTo } = useMapboxCamera({ mapId })

const presets: { label: string, center: LngLatLike, zoom: number }[] = [
  { label: 'Beijing', center: [116.397, 39.908], zoom: 10 },
  { label: 'Shanghai', center: [121.473, 31.230], zoom: 10 },
  { label: 'Shenzhen', center: [114.057, 22.543], zoom: 10 }
]

function go(center: LngLatLike, zoom: number) {
  flyTo({ center, zoom, duration: 2000 })
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :map-id="mapId"
      :options="{ style: 'mapbox://styles/mapbox/streets-v12', center: [116.397, 39.908], zoom: 10 }"
    >
      <div class="absolute left-3 top-3 z-10 flex flex-wrap gap-2">
        <UButton
          v-for="p in presets"
          :key="p.label"
          size="xs"
          color="neutral"
          variant="solid"
          @click="go(p.center, p.zoom)"
        >
          {{ p.label }}
        </UButton>
      </div>
    </MapboxMap>
  </div>
</template>
