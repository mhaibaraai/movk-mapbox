<script setup lang="ts">
import type { FeatureCollection } from 'geojson'

const size = 64
const FRAME_COUNT = 30

const data: FeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [116.397, 39.908] } }
  ]
}

// 用 canvas 逐帧绘制扩散圆环，生成 ImageData 序列
function buildFrames(): ImageData[] {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')!
  return Array.from({ length: FRAME_COUNT }, (_, i) => {
    const t = i / FRAME_COUNT
    context.clearRect(0, 0, size, size)
    context.beginPath()
    context.arc(size / 2, size / 2, (size / 2 - 3) * t, 0, Math.PI * 2)
    context.strokeStyle = `rgba(34, 211, 238, ${1 - t})`
    context.lineWidth = 3
    context.stroke()
    return context.getImageData(0, 0, size, size)
  })
}

const { map } = useMap()
const frames = ref<ImageData[]>([])

onMounted(() => {
  frames.value = buildFrames()
  // 帧晚于样式就绪生成，触发一帧启动渲染循环
  map.value?.triggerRepaint()
})

useFrameIcon({ imageName: 'pulse-ring', size, frames: () => frames.value, fps: 24 })
</script>

<template>
  <MapboxSource source-id="pulse-pts" :source="{ type: 'geojson', data }">
    <MapboxLayer
      layer-id="pulse-pts"
      type="symbol"
      source="pulse-pts"
      :layout="{ 'icon-image': 'pulse-ring', 'icon-allow-overlap': true }"
    />
  </MapboxSource>
</template>
