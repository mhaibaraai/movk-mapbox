<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

const speed = ref(1)
const lnglat = ref<LngLatLike>([113.26, 23.13])

// 公开 lottie 动画(可替换为自有 .json URL 或 animationData 内联对象)
const path = 'https://assets10.lottiefiles.com/packages/lf20_jcikwtux.json'
</script>

<template>
  <MapShowcase
    title="LottieMarker 动画标记"
    description="lottie-web 在标记位渲染矢量动画(走 Marker DOM,非 icon 帧驱动);lottie-web 为 optional peer,用到才装。"
  >
    <template #toolbar>
      <span class="text-xs text-muted">速度</span>
      <USlider v-model="speed" :min="0.2" :max="3" :step="0.1" class="w-28" />
      <span class="text-xs text-muted">{{ speed.toFixed(1) }}×</span>
    </template>

    <DemoMap :center="[113.26, 23.13]" :zoom="13">
      <MapboxLottieMarker v-model:lnglat="lnglat" :path="path" :speed="speed" :width="96" :height="96" />
    </DemoMap>
  </MapShowcase>
</template>
