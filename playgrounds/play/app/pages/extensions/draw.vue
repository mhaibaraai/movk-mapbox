<script setup lang="ts">
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
const lastEvent = ref<string>('—')

function onCreate(created: Feature[]) {
  features.value = [...features.value, ...created]
  lastEvent.value = `create × ${created.length}`
}
function onUpdate(_updated: Feature[]) {
  lastEvent.value = 'update'
}
function onDelete(deleted: Feature[]) {
  const ids = new Set(deleted.map(f => f.id))
  features.value = features.value.filter(f => !ids.has(f.id))
  lastEvent.value = `delete × ${deleted.length}`
}
</script>

<template>
  <MapShowcase
    title="Draw 绘制"
    description="封装 @mapbox/mapbox-gl-draw，暴露 create/update/delete 等事件。绘制点/线/面后查看右侧统计。"
    :state="{ count: features.length, lastEvent }"
  >
    <DemoMap :center="[116.39, 39.91]" :zoom="11">
      <MapboxDrawControl
        position="top-left"
        :options="{
          displayControlsDefault: false,
          controls: { polygon: true, line_string: true, point: true, trash: true }
        }"
        @create="onCreate"
        @update="onUpdate"
        @delete="onDelete"
      />
    </DemoMap>
  </MapShowcase>
</template>
