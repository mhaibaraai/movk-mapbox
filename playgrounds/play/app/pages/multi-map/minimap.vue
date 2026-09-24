<script setup lang="ts">
const followStyle = ref(true)
const zoomOffset = ref(-4)
</script>

<template>
  <MapShowcase
    title="Minimap 鹰眼"
    description="MaplibreMinimap 随主图同步并标出视口；拖拽鹰眼平移主图，单击缓动到点击处。切换全局底图可验证样式跟随。"
  >
    <template #toolbar>
      <USwitch v-model="followStyle" label="沿用主图样式" />
      <UInputNumber v-model="zoomOffset" :min="-8" :max="0" size="sm" class="w-28" />
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="11" :pitch="30">
      <MaplibreNavigationControl position="top-right" />
      <MaplibreMinimap
        position="bottom-right"
        :map-style="followStyle ? undefined : 'https://tiles.openfreemap.org/styles/positron'"
        :zoom-offset="zoomOffset"
      />
    </DemoMap>
  </MapShowcase>
</template>
