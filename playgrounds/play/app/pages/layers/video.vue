<script setup lang="ts">
const videoRef = ref<{ play: () => void, pause: () => void }>()
const playing = ref(true)

// mapbox 官方无人机航拍示例视频
const urls = [
  'https://static-assets.mapbox.com/mapbox-gl-js/drone.mp4',
  'https://static-assets.mapbox.com/mapbox-gl-js/drone.webm'
]
const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
  [-122.51596391201019, 37.56238816766053],
  [-122.51467645168304, 37.56410183312965],
  [-122.51309394836426, 37.563391708549425],
  [-122.51423120498657, 37.56161849366671]
]

function toggle() {
  if (playing.value) {
    videoRef.value?.pause()
  } else {
    videoRef.value?.play()
  }
  playing.value = !playing.value
}
</script>

<template>
  <MapShowcase
    title="VideoLayer 视频图层"
    description="MapboxVideoLayer 便捷组件：地理参考视频叠加，暴露 play/pause 控制。"
  >
    <template #toolbar>
      <UButton size="sm" :icon="playing ? 'i-lucide-pause' : 'i-lucide-play'" @click="toggle">
        {{ playing ? '暂停' : '播放' }}
      </UButton>
    </template>

    <DemoMap :center="[-122.514426, 37.562984]" :zoom="17" :bearing="-96">
      <MapboxVideoLayer ref="videoRef" layer-id="drone" :urls="urls" :coordinates="coordinates" />
    </DemoMap>
  </MapShowcase>
</template>
