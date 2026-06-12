<script setup lang="ts">
const routes = [
  { from: [116.40, 39.90] as [number, number], to: [121.47, 31.23] as [number, number] },
  { from: [116.40, 39.90] as [number, number], to: [113.26, 23.13] as [number, number] },
  { from: [116.40, 39.90] as [number, number], to: [104.07, 30.67] as [number, number] },
  { from: [116.40, 39.90] as [number, number], to: [120.15, 30.27] as [number, number] },
  { from: [116.40, 39.90] as [number, number], to: [114.31, 30.59] as [number, number] }
]
</script>

<template>
  <MapShowcase
    title="Migration 迁徙图"
    description="OD 对生成贝塞尔弧线，粒子沿预计算长度表循环飞行 + 渐变尾迹。"
  >
    <DemoMap map-style="mapbox://styles/mapbox/dark-v11" :center="[112, 32]" :zoom="4.2">
      <MapboxMigration :data="routes" color="#fb7185" :duration="3600" />
    </DemoMap>
  </MapShowcase>
</template>
