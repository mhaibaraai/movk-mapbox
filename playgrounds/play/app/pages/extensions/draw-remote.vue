<script setup lang="ts">
import type { Feature } from 'geojson'

const MAP_ID = 'play-draw-remote'

const features = ref<Feature[]>([])
const mode = ref('simple_select')

// 工具栏位于 MapboxMap 组件树之外：按 mapId 查注册表驱动绘制
const { changeMode, deleteAll, add, getMode } = useMapboxDraw({ mapId: MAP_ID })

const samplePoint: Feature = {
  type: 'Feature',
  properties: {},
  geometry: { type: 'Point', coordinates: [116.39, 39.91] }
}

const state = computed(() => ({
  mode: mode.value,
  liveMode: getMode() ?? null,
  count: features.value.length
}))
</script>

<template>
  <MapShowcase
    title="Draw 跨组件树驱动"
    description="useMapboxDraw({ mapId }) 在 MapboxMap 之外按 id 查注册表；写操作等待实例就绪并回写 v-model:features / v-model:mode。"
    :state="state"
  >
    <template #toolbar>
      <UButton size="sm" variant="soft" @click="changeMode('draw_point')">
        画点
      </UButton>
      <UButton size="sm" variant="soft" @click="changeMode('draw_line_string')">
        画线
      </UButton>
      <UButton size="sm" variant="soft" @click="changeMode('draw_polygon')">
        画面
      </UButton>
      <UButton size="sm" @click="add(samplePoint)">
        程序式加点
      </UButton>
      <UButton size="sm" color="error" variant="soft" :disabled="!features.length" @click="deleteAll">
        清空
      </UButton>
    </template>

    <DemoMap :map-id="MAP_ID" :center="[116.39, 39.91]" :zoom="11">
      <MapboxDrawControl
        v-model:features="features"
        v-model:mode="mode"
        position="top-left"
        :options="{
          displayControlsDefault: false,
          controls: { polygon: true, line_string: true, point: true, trash: true }
        }"
      />
    </DemoMap>
  </MapShowcase>
</template>
