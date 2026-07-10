<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

// draggable marker：拖拽结束回写 lnglat（v-model）
const draggable = ref<[number, number]>([116.39, 39.91])
const defaultPos: LngLatLike = [116.45, 39.93]
const popupPos: LngLatLike = [116.36, 39.95]

const group: { id: string, lnglat: [number, number], name: string }[] = [
  { id: 'a', lnglat: [116.30, 39.88], name: '点位 A' },
  { id: 'b', lnglat: [116.50, 39.88], name: '点位 B' }
]
</script>

<template>
  <MapShowcase
    title="Marker 标记"
    description="默认插槽渲染自定义 DOM；draggable 时拖拽结束回写 v-model:lnglat；#popup 插槽按 trigger 挂载弹窗。"
    :state="{ draggable }"
    state-label="Dragged"
  >
    <DemoMap :center="[116.42, 39.92]" :zoom="11">
      <!-- 原生默认 marker（无插槽） -->
      <MapboxMarker :lnglat="defaultPos" />

      <!-- 自定义 DOM + 可拖拽 -->
      <MapboxMarker v-model:lnglat="draggable" :options="{ draggable: true }">
        <div class="rounded-full bg-primary px-3 py-1 text-xs font-medium text-inverted shadow-lg cursor-move">
          拖我
        </div>
      </MapboxMarker>

      <!-- #popup 插槽：默认 click 触发，插槽暴露 close -->
      <MapboxMarker :lnglat="popupPos" :popup-options="{ offset: 16 }">
        <div class="rounded-full bg-info px-3 py-1 text-xs font-medium text-inverted shadow-lg cursor-pointer">
          点我
        </div>
        <template #popup="{ close }">
          <div class="w-40 px-1 py-0.5">
            <p class="font-semibold">
              自定义弹窗
            </p>
            <p class="mt-0.5 text-xs text-muted">
              内容可以是任意 Vue 组件
            </p>
            <UButton class="mt-2" size="xs" color="neutral" variant="subtle" @click="close">
              关闭
            </UButton>
          </div>
        </template>
      </MapboxMarker>

      <!-- 一组 marker 默认全部展开，互不互斥 -->
      <MapboxMarker
        v-for="point in group"
        :key="point.id"
        :lnglat="point.lnglat"
        :open="true"
        :popup-options="{ offset: 14, closeButton: false, closeOnClick: false }"
      >
        <div class="size-3 rounded-full border-2 border-white bg-error shadow cursor-pointer" />
        <template #popup>
          <div class="px-1 text-xs font-semibold">
            {{ point.name }}
          </div>
        </template>
      </MapboxMarker>
    </DemoMap>
  </MapShowcase>
</template>
