<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

// draggable marker：拖拽结束回写 lnglat（v-model）
const draggable = ref<[number, number]>([116.39, 39.91])
const defaultPos: LngLatLike = [116.45, 39.93]
</script>

<template>
  <MapShowcase
    title="Marker 标记"
    description="默认插槽渲染自定义 DOM；draggable 时拖拽结束回写 v-model:lnglat。"
    :state="{ draggable }"
    state-label="Dragged"
  >
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/streets-v12', center: [116.42, 39.92], zoom: 12 }">
      <!-- 原生默认 marker（无插槽） -->
      <MapboxMarker :lnglat="defaultPos" />

      <!-- 自定义 DOM + 可拖拽 -->
      <MapboxMarker v-model:lnglat="draggable" :options="{ draggable: true }">
        <div class="rounded-full bg-primary px-3 py-1 text-xs font-medium text-inverted shadow-lg cursor-move">
          拖我
        </div>
      </MapboxMarker>
    </MapboxMap>
  </MapShowcase>
</template>
