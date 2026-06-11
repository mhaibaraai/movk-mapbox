<script setup lang="ts">
const { exportImage, download } = useMapExport({ mapId: 'print-demo' })

const preview = ref<string>()
const busy = ref(false)

async function onPreview() {
  busy.value = true
  try {
    preview.value = await exportImage({ format: 'image/png' })
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <MapShowcase
    title="Print 地图导出"
    description="useMapExport 在 render 回调内读画布,免 preserveDrawingBuffer;导出含当前底图与图层。"
  >
    <template #toolbar>
      <UButton size="sm" :loading="busy" icon="i-lucide-camera" @click="onPreview">
        预览
      </UButton>
      <UButton size="sm" variant="soft" icon="i-lucide-download" @click="download({ fileName: 'movk-map.png' })">
        下载 PNG
      </UButton>
    </template>

    <template #aside>
      <div class="rounded-lg border border-default bg-default p-3">
        <p class="mb-2 text-xs font-medium uppercase text-dimmed">
          导出预览
        </p>
        <img v-if="preview" :src="preview" alt="map export" class="w-full rounded border border-default">
        <p v-else class="text-xs text-muted">
          点击「预览」生成截图
        </p>
      </div>
    </template>

    <DemoMap map-id="print-demo" :center="[116.39, 39.91]" :zoom="11" />
  </MapShowcase>
</template>
