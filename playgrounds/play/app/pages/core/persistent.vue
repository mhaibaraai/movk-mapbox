<script setup lang="ts">
const visible = ref(true)
const mapId = 'persistent-demo'

// 经 useMapbox(id) 在组件树之外访问已挂载实例（逃生口）
function flyRandom() {
  const ctx = useMapbox(mapId)
  ctx?.map.value?.flyTo({
    center: [116 + Math.random() * 4, 39 + Math.random() * 2],
    zoom: 9 + Math.random() * 3
  })
}
</script>

<template>
  <MapShowcase
    title="跨路由持久化"
    description="persistent + map-id：配合 <KeepAlive> 切换显隐时复用同一实例，不重建。useMapbox(id) 可在树外访问。"
    height="420px"
  >
    <template #toolbar>
      <USwitch v-model="visible" label="显示地图" />
      <UButton size="xs" variant="soft" @click="flyRandom">
        外部 flyTo
      </UButton>
    </template>

    <KeepAlive>
      <MapboxMap
        v-if="visible"
        :map-id="mapId"
        persistent
        :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.39, 39.91], zoom: 10 }"
      />
    </KeepAlive>
    <div v-if="!visible" class="absolute inset-0 grid place-items-center text-sm text-muted">
      地图已隐藏，实例仍保留在内存中
    </div>
  </MapShowcase>
</template>
