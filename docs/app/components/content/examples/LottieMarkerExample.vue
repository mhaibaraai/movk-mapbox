<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

const position = ref<LngLatLike>([116.397, 39.908])

// 内联 lottie 动画数据：一个循环缩放 + 渐隐的圆点
const animationData = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: 'pulse',
  ddd: 0,
  assets: [],
  layers: [{
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: 'circle',
    sr: 1,
    ks: {
      o: { a: 1, k: [{ t: 0, s: [100] }, { t: 30, s: [30] }, { t: 60, s: [100] }] },
      r: { a: 0, k: 0 },
      p: { a: 0, k: [50, 50, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 1, k: [{ t: 0, s: [50, 50, 100] }, { t: 30, s: [100, 100, 100] }, { t: 60, s: [50, 50, 100] }] }
    },
    shapes: [{
      ty: 'gr',
      it: [
        { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [70, 70] } },
        { ty: 'fl', c: { a: 0, k: [0.894, 0.247, 0.341, 1] }, o: { a: 0, k: 100 } },
        { ty: 'tr', p: { a: 0, k: [0, 0] }, a: { a: 0, k: [0, 0] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 }, o: { a: 0, k: 100 } }
      ]
    }],
    ip: 0,
    op: 60,
    st: 0,
    bm: 0
  }]
}
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
