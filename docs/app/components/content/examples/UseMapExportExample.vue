<script setup lang="ts">
const mapId = 'use-map-export-demo'

const preview = ref('')
const { exportImage, download } = useMapExport({ mapId })

async function snapshot() {
  preview.value = await exportImage()
}
</script>

<template>
  <div class="relative h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MapboxMap :map-id="mapId" :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.908], zoom: 11 }" />
    <div class="absolute left-2 top-2 z-10 flex gap-1">
      <UButton size="sm" @click="snapshot">
        截图预览
      </UButton>
      <UButton size="sm" variant="soft" @click="download({ fileName: 'map.png' })">
        下载 PNG
      </UButton>
    </div>
    <img v-if="preview" :src="preview" alt="地图截图" class="absolute bottom-2 right-2 z-10 h-28 rounded ring ring-default">
  </div>
</template>
