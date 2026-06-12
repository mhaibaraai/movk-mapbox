<script setup lang="ts">
import type { LngLatLike } from 'mapbox-gl'

const lnglat = ref<LngLatLike>([116.397, 39.908])
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/streets-v12', center: [116.397, 39.908], zoom: 13 }">
      <!-- 默认插槽渲染弹窗内容 -->
      <MapboxPopup :lnglat="lnglat" :options="{ closeOnClick: false, offset: 12 }">
        <div class="px-1 py-0.5">
          <p class="font-semibold">
            天安门
          </p>
          <p class="text-sm text-muted">
            北京市东城区
          </p>
        </div>
      </MapboxPopup>
    </MapboxMap>
  </div>
</template>
