<script setup lang="ts">
const enabled = ref(true)

useMapSync(['play-sync-a', 'play-sync-b', 'play-sync-c'], { enabled })
</script>

<template>
  <MapShowcase
    title="useMapSync 多图联动"
    description="三张地图按 map-id 联动相机，任一地图拖动、缩放、旋转都会同步其余地图；关闭后再开启以首图对齐。"
  >
    <template #toolbar>
      <USwitch v-model="enabled" label="联动" />
    </template>

    <div class="grid h-full grid-cols-3 gap-px bg-(--ui-border)">
      <MaplibreMap map-id="play-sync-a" :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908], zoom: 11 }" />
      <MaplibreMap map-id="play-sync-b" :options="{ style: 'https://tiles.openfreemap.org/styles/dark', center: [116.397, 39.908], zoom: 11 }" />
      <MaplibreMap map-id="play-sync-c" :options="{ center: [116.397, 39.908], zoom: 11 }">
        <MaplibreTiandituLayer layer="img" annotation />
      </MaplibreMap>
    </div>
  </MapShowcase>
</template>
