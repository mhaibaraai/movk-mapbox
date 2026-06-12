<script setup lang="ts">
const opacity = ref(0.9)

// mapbox 官方雷达回波示例图
const coordinates: [[number, number], [number, number], [number, number], [number, number]] = [
  [-80.425, 46.437],
  [-71.516, 46.437],
  [-71.516, 37.936],
  [-80.425, 37.936]
]
</script>

<template>
  <MapShowcase
    title="ImageLayer 图片图层"
    description="MapboxImageLayer 便捷组件：传 url 与四角坐标即叠加地理参考图片，拖动滑块调整不透明度。"
  >
    <template #toolbar>
      <USlider v-model="opacity" :min="0" :max="1" :step="0.05" class="w-32" />
    </template>

    <DemoMap :center="[-75.789, 41.874]" :zoom="5">
      <MapboxImageLayer
        layer-id="radar"
        url="https://docs.mapbox.com/mapbox-gl-js/assets/radar.gif"
        :coordinates="coordinates"
        :opacity="opacity"
      />
    </DemoMap>
  </MapShowcase>
</template>
