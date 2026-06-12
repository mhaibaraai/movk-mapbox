<script setup lang="ts">
import type { Feature } from 'geojson'

const features = ref<Feature[]>([])
const mode = ref('simple_select')

// 导出即序列化 features 模型；还原即赋值触发 draw.set
const snapshot = ref<Feature[]>()

function saveSnapshot() {
  snapshot.value = JSON.parse(JSON.stringify(features.value)) as Feature[]
}
function restoreSnapshot() {
  if (snapshot.value) features.value = snapshot.value
}
function clearAll() {
  features.value = []
}

const state = computed(() => ({
  mode: mode.value,
  count: features.value.length,
  snapshotCount: snapshot.value?.length ?? null
}))
</script>

<template>
  <MapShowcase
    title="Draw 绘制（受控）"
    description="v-model:features 受控要素集合 + v-model:mode 模式切换；导出/清空/还原全经模型完成，无需触碰实例。"
    :state="state"
  >
    <template #toolbar>
      <UButton size="sm" variant="soft" @click="mode = 'draw_point'">
        画点
      </UButton>
      <UButton size="sm" variant="soft" @click="mode = 'draw_line_string'">
        画线
      </UButton>
      <UButton size="sm" variant="soft" @click="mode = 'draw_polygon'">
        画面
      </UButton>
      <UButton size="sm" :disabled="!features.length" @click="saveSnapshot">
        导出快照
      </UButton>
      <UButton size="sm" color="error" variant="soft" :disabled="!features.length" @click="clearAll">
        清空
      </UButton>
      <UButton size="sm" :disabled="!snapshot" @click="restoreSnapshot">
        还原快照
      </UButton>
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="11">
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
