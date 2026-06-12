<script setup lang="ts">
import type { FeatureCollection, Point } from 'geojson'

const fps = ref(12)
const FRAMES = 12
const FRAME_SIZE = 64

// 程序生成横向雪碧图(12 帧旋转箭头),免外部资源,自包含演示
const spriteUrl = ref('')

onMounted(() => {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_SIZE * FRAMES
  canvas.height = FRAME_SIZE
  const c = canvas.getContext('2d')
  if (!c) return
  for (let i = 0; i < FRAMES; i++) {
    const t = i / FRAMES
    c.save()
    c.translate(i * FRAME_SIZE + FRAME_SIZE / 2, FRAME_SIZE / 2)
    c.rotate(t * Math.PI * 2)
    c.fillStyle = `hsl(${Math.round(t * 360)}, 80%, 55%)`
    c.beginPath()
    c.moveTo(0, -22)
    c.lineTo(15, 18)
    c.lineTo(0, 8)
    c.lineTo(-15, 18)
    c.closePath()
    c.fill()
    c.restore()
  }
  spriteUrl.value = canvas.toDataURL()
})

const data: FeatureCollection<Point> = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [113.26, 23.13] } },
    { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [113.32, 23.16] } }
  ]
}
</script>

<template>
  <MapShowcase
    title="SpriteImage 帧动画图标"
    description="雪碧图切帧 + StyleImageInterface 每帧自重绘驱动 symbol 图标循环播放,零解码依赖;滑块调整帧率。"
  >
    <template #toolbar>
      <span class="text-xs text-muted">帧率</span>
      <USlider v-model="fps" :min="2" :max="30" :step="1" class="w-28" />
      <span class="text-xs text-muted">{{ fps }} fps</span>
    </template>

    <DemoMap :center="[113.29, 23.145]" :zoom="13">
      <MapboxSpriteImage
        v-if="spriteUrl"
        :data="data"
        :image="spriteUrl"
        :frames="FRAMES"
        :columns="FRAMES"
        :fps="fps"
        :size="48"
      />
    </DemoMap>
  </MapShowcase>
</template>
