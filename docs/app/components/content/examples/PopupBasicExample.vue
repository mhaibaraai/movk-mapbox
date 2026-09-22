<script setup lang="ts">
import type { LngLatLike } from 'maplibre-gl'

const lnglat = ref<LngLatLike>([116.397, 39.908])
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 13 }">
      <!-- 默认插槽渲染弹窗内容 -->
      <MaplibrePopup :lnglat="lnglat" :options="{ closeOnClick: false, offset: 12 }">
        <div class="px-1 py-0.5">
          <p class="font-semibold">
            天安门
          </p>
          <p class="text-sm text-muted">
            北京市东城区
          </p>
        </div>
      </MaplibrePopup>
    </MaplibreMap>
  </div>
</template>
