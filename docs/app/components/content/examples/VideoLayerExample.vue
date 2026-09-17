<script setup lang="ts">
const videoLayer = useTemplateRef('videoLayer')

// 四角经纬度：左上 / 右上 / 右下 / 左下
const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
  [-122.51596391201019, 37.56238816766053],
  [-122.51467645168304, 37.56410183312965],
  [-122.51309394836426, 37.563391708549425],
  [-122.51423120498657, 37.56161849366671]
]

// Esri World Imagery 栅格影像，无需 key
const imagery = ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}']

const urls = [
  'https://static-assets.mapbox.com/mapbox-gl-js/drone.mp4',
  'https://static-assets.mapbox.com/mapbox-gl-js/drone.webm'
]
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ center: [-122.514, 37.563], zoom: 17, bearing: -96 }">
      <div class="absolute left-3 top-3 z-10 flex gap-2">
        <UButton size="xs" color="neutral" variant="solid" @click="videoLayer?.play()">
          Play
        </UButton>
        <UButton size="xs" color="neutral" variant="solid" @click="videoLayer?.pause()">
          Pause
        </UButton>
      </div>
      <MaplibreRasterLayer :tiles="imagery" :tile-size="256" attribution="Tiles © Esri" />
      <MaplibreVideoLayer ref="videoLayer" :urls="urls" :coordinates="coordinates" />
    </MaplibreMap>
  </div>
</template>
