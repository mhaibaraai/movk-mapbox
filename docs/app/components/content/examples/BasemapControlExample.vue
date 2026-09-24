<script setup lang="ts">
import type { BasemapItem } from '#maplibre/types'
import { tiandituStyle } from '@movk/maplibre/utils/tianditu'

const items: BasemapItem[] = [
  { label: 'OpenFreeMap Liberty', style: 'https://tiles.openfreemap.org/styles/liberty' },
  { label: 'OpenFreeMap Dark', style: 'https://tiles.openfreemap.org/styles/dark' },
  { label: '天地图 影像', style: tiandituStyle('img', { annotation: true }) },
  { label: '天地图 矢量', style: tiandituStyle('vec', { annotation: true }) }
]

// 同一个值同时绑定底图控件与地图样式：控件只负责选择，地图负责切换
const style = shallowRef(items[0]!.style)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style, center: [116.397, 39.908], zoom: 11 }">
      <MaplibreBasemapControl v-model="style" :items="items" position="top-right" />
    </MaplibreMap>
  </div>
</template>
