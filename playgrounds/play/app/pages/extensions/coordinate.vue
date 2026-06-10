<script setup lang="ts">
import { transformPoint } from '#mapbox/utils/coordinate'
import type { LngLatLike } from 'mapbox-gl'

// WGS84 原始坐标（GPS），转换为 GCJ02（国测局，高德/腾讯）后存在偏移
const wgs84 = ref<[number, number]>([116.397, 39.909])

const gcj02 = computed<[number, number]>(() => transformPoint(wgs84.value, 'WGS84', 'GCJ02'))
const bd09 = computed<[number, number]>(() => transformPoint(wgs84.value, 'WGS84', 'BD09'))

const gcjPos = computed<LngLatLike>(() => gcj02.value)
</script>

<template>
  <MapShowcase
    title="坐标系转换"
    description="utils/coordinate 薄封装 gcoord：WGS84 / GCJ02 / BD09 互转。蓝点为原始 WGS84，绿点为 GCJ02 偏移后。"
    :state="{ wgs84, gcj02, bd09 }"
    state-label="Coordinates"
  >
    <DemoMap :center="[116.397, 39.909]" :zoom="16">
      <MapboxMarker v-model:lnglat="wgs84">
        <div class="rounded-full bg-info size-3 ring-2 ring-white" />
      </MapboxMarker>
      <MapboxMarker :lnglat="gcjPos">
        <div class="rounded-full bg-primary size-3 ring-2 ring-white" />
      </MapboxMarker>
    </DemoMap>
  </MapShowcase>
</template>
