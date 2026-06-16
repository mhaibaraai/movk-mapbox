<script setup lang="ts">
import { transformPoint } from '@movk/mapbox/utils/coordinate'

// 上海人民广场（WGS84 原始坐标，天地图直接对齐）
const wgs84: [number, number] = [121.4737, 31.2304]
// 转成 GCJ02（高德/腾讯坐标系）后叠在天地图上会偏移
const gcj02 = transformPoint(wgs84, 'WGS84', 'GCJ02')
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: wgs84, zoom: 15 }">
      <MapboxTiandituLayer layer="vec" annotation />
      <MapboxMarker :lnglat="wgs84">
        <div class="rounded bg-success px-2 py-0.5 text-xs font-medium text-inverted">
          WGS84：对齐天地图
        </div>
      </MapboxMarker>
      <MapboxMarker :lnglat="gcj02">
        <div class="rounded bg-error px-2 py-0.5 text-xs font-medium text-inverted">
          GCJ02：用于高德/腾讯，叠天地图会偏移
        </div>
      </MapboxMarker>
    </MapboxMap>
  </div>
</template>
