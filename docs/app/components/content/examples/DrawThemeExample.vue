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

const options = computed(() => ({
  displayControlsDefault: false,
  userProperties: true,
  styles: drawThemeStyles({ color: props.color })
}))
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.395, 39.91], zoom: 12 }">
      <!-- color 变化经 :key 重建控件按新主题重绘 -->
      <MapboxDrawControl :key="color" v-model:features="features" :options="options" />
    </MapboxMap>
  </div>
</template>
