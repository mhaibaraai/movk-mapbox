<script setup lang="ts">
const videoLayer = useTemplateRef('videoLayer')

// 四角经纬度：左上 / 右上 / 右下 / 左下
const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
  [-122.51596391201019, 37.56238816766053],
  [-122.51467645168304, 37.56410183312965],
  [-122.51309394836426, 37.563391708549425],
  [-122.51423120498657, 37.56161849366671]
]

const urls = [
  'https://static-assets.mapbox.com/mapbox-gl-js/drone.mp4',
  'https://static-assets.mapbox.com/mapbox-gl-js/drone.webm'
]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/satellite-streets-v12', center: [-122.514, 37.563], zoom: 17, bearing: -96 }">
      <div class="absolute left-3 top-3 z-10 flex gap-2">
        <UButton size="xs" color="neutral" variant="solid" @click="videoLayer?.play()">
          Play
        </UButton>
        <UButton size="xs" color="neutral" variant="solid" @click="videoLayer?.pause()">
          Pause
        </UButton>
      </div>
      <MapboxVideoLayer ref="videoLayer" :urls="urls" :coordinates="coordinates" />
    </MapboxMap>
  </div>
</template>
