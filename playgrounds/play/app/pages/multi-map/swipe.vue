<script setup lang="ts">
const active = ref(true)
const vertical = ref(true)
const imagery = ref(true)
const position = ref(0.5)
</script>

<template>
  <MapShowcase
    title="Swipe 卷帘对比"
    description="MaplibreSwipe 作为主图子组件叠加对照图：v-if 开关不影响主图，主图控件常驻，对照版权随分隔条移动，露出区域内对照图层可交互。"
    :state="{ active, orientation: vertical ? 'vertical' : 'horizontal', position: Number(position.toFixed(3)) }"
  >
    <template #toolbar>
      <USwitch v-model="active" label="启用卷帘" />
      <USwitch v-model="vertical" label="竖直分隔" />
      <USwitch v-model="imagery" label="天地图影像（关闭为暗色样式）" />
    </template>

    <DemoMap :center="[116.397, 39.908]" :zoom="11">
      <MaplibreNavigationControl position="top-right" />
      <MaplibreScaleControl position="bottom-left" />
      <MaplibreSwipe
        v-if="active"
        v-model:position="position"
        :orientation="vertical ? 'vertical' : 'horizontal'"
        :map-style="imagery ? undefined : 'https://tiles.openfreemap.org/styles/dark'"
      >
        <MaplibreTiandituLayer v-if="imagery" layer="img" annotation />
      </MaplibreSwipe>
    </DemoMap>
  </MapShowcase>
</template>
