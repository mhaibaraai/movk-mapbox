<script setup lang="ts">
import { bufferPaints } from '@movk/mapbox/utils/buffer'
import type { FeatureCollection } from 'geojson'

const center: [number, number] = [116.397, 39.908]

// 生成近似圆形缓冲区环（演示用，无需 turf）
function circle(c: [number, number], radiusKm: number, steps = 64): FeatureCollection {
  const coords: [number, number][] = []
  const dLat = radiusKm / 110.574
  const dLng = radiusKm / (111.320 * Math.cos((c[1] * Math.PI) / 180))
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * 2 * Math.PI
    coords.push([c[0] + dLng * Math.cos(a), c[1] + dLat * Math.sin(a)])
  }
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [coords] } }] }
}

const data = circle(center, 3)
const paints = bufferPaints({ color: '#3b82f6' })
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center, zoom: 11 }">
      <MapboxSource source-id="buffer" :source="{ type: 'geojson', data }">
        <MapboxLayer layer-id="buffer-fill" type="fill" source="buffer" :paint="paints.fill" />
        <MapboxLayer layer-id="buffer-line" type="line" source="buffer" :paint="paints.line" />
      </MapboxSource>
    </MapboxMap>
  </div>
</template>
