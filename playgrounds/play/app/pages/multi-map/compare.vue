<script setup lang="ts">
const position = ref(0.5)
const vertical = ref(true)
const sync = ref(true)
</script>

<template>
  <MapShowcase
    title="Compare 卷帘对比"
    description="MaplibreCompare 叠放两张地图并按分隔条裁切后图，相机自动联动；支持拖拽、方向键与 Home/End。"
    :state="{ position: Number(position.toFixed(3)), orientation: vertical ? 'vertical' : 'horizontal', sync }"
  >
    <template #toolbar>
      <USwitch v-model="vertical" label="竖直分隔" />
      <USwitch v-model="sync" label="相机联动" />
    </template>

    <MaplibreCompare v-model:position="position" :orientation="vertical ? 'vertical' : 'horizontal'" :sync="sync">
      <template #before>
        <MaplibreMap :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 11 }" />
      </template>
      <template #after>
        <MaplibreMap :options="{ center: [116.397, 39.908], zoom: 11 }">
          <MaplibreTiandituLayer layer="img" annotation />
          <MaplibreNavigationControl position="bottom-right" />
        </MaplibreMap>
      </template>
    </MaplibreCompare>
  </MapShowcase>
</template>
