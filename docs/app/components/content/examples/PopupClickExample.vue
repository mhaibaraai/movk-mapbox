<script setup lang="ts">
import type { LngLatLike, MapEventOf } from 'mapbox-gl'

const lnglat = ref<LngLatLike | null>(null)
const label = ref('')

// 点击地图取坐标，弹窗随之定位（同一 Popup 经 watch 增量更新位置）
function onClick(event: MapEventOf<'click'>) {
  const { lng, lat } = event.lngLat
  lnglat.value = [lng, lat]
  label.value = `${lng.toFixed(4)}, ${lat.toFixed(4)}`
}
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap
      :options="{ style: 'mapbox://styles/mapbox/streets-v12', center: [116.397, 39.908], zoom: 12 }"
      @click="onClick"
    >
      <MapboxPopup v-if="lnglat" :lnglat="lnglat" :options="{ offset: 8 }">
        <div class="px-1 py-0.5 text-sm">
          {{ label }}
        </div>
      </MapboxPopup>
      <div v-if="!lnglat" class="absolute left-3 top-3 z-10 rounded-(--ui-radius) border border-default bg-default/80 px-3 py-1.5 text-sm backdrop-blur">
        点击地图任意位置
      </div>
    </MapboxMap>
  </div>
</template>
