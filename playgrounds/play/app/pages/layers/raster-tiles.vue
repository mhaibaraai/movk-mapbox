<script setup lang="ts">
const opacity = ref(1)

// OpenStreetMap 标准瓦片，演示任意 XYZ URL 模板接入
const tiles = ['https://tile.openstreetmap.org/{z}/{x}/{y}.png']
</script>

<template>
  <MapShowcase
    title="RasterLayer URL 模板图层"
    description="MapboxRasterLayer 便捷组件：tiles 传 {z}/{x}/{y} 模板即接入任意 XYZ 瓦片服务，与 WMTS/WMS/天地图组件同族。"
  >
    <template #toolbar>
      <USlider v-model="opacity" :min="0" :max="1" :step="0.05" class="w-32" />
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="10">
      <MapboxRasterLayer
        layer-id="osm"
        :tiles="tiles"
        :opacity="opacity"
        attribution="© OpenStreetMap contributors"
      />
    </DemoMap>
  </MapShowcase>
</template>
