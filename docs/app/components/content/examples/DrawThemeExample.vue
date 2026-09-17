<script setup lang="ts">
import { computed } from 'vue'
import type { Feature } from 'geojson'

const props = withDefaults(defineProps<{ color?: string }>(), {
  color: '#8b5cf6'
})

// 预置多边形，主题色即时可见
const features = ref<Feature[]>([{
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [[[116.38, 39.90], [116.41, 39.90], [116.41, 39.92], [116.38, 39.92], [116.38, 39.90]]]
  }
}])

// terra-draw 主题色需为十六进制色值
const theme = computed(() => ({ color: props.color as `#${string}` }))
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.395, 39.91], zoom: 12 }">
      <!-- color 变化经 :key 重建控件按新主题重绘 -->
      <MaplibreDrawControl :key="color" v-model:features="features" :controls="false" :theme="theme" />
    </MaplibreMap>
  </div>
</template>
