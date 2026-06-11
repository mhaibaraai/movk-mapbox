<script setup lang="ts">
import type { Feature } from 'geojson'

const drawRef = ref<{ setFeatureProperty: (id: string, key: string, value: unknown) => void }>()
const features = ref<Feature[]>([])
const selectedId = ref<string>()

// 自定义主题 styles + userProperties:要素 user_color 覆盖主题色
const options = {
  displayControlsDefault: false,
  controls: { polygon: true, line_string: true, point: true, trash: true },
  userProperties: true,
  styles: drawThemeStyles({ color: '#3b82f6', activeColor: '#f59e0b' })
}

const swatches = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

function onSelectionChange(selected: Feature[]) {
  selectedId.value = selected[0]?.id !== undefined ? String(selected[0]!.id) : undefined
}

function applyColor(color: string) {
  if (selectedId.value) drawRef.value?.setFeatureProperty(selectedId.value, 'user_color', color)
}

const state = computed(() => ({
  selected: selectedId.value ?? null,
  colors: features.value.map(f => f.properties?.user_color ?? null)
}))
</script>

<template>
  <MapShowcase
    title="Draw 样式主题"
    description="drawThemeStyles + userProperties:绘制后选中要素,点色块经 setFeatureProperty 写 user_color 实时改色。"
    :state="state"
  >
    <template #toolbar>
      <span class="text-xs text-muted">{{ selectedId ? '选中要素改色:' : '先绘制并选中要素' }}</span>
      <button
        v-for="c in swatches"
        :key="c"
        class="size-6 rounded border border-default disabled:opacity-30"
        :style="{ backgroundColor: c }"
        :disabled="!selectedId"
        @click="applyColor(c)"
      />
    </template>

    <DemoMap :center="[116.39, 39.91]" :zoom="11">
      <MapboxDrawControl
        ref="drawRef"
        v-model:features="features"
        position="top-left"
        :options="options"
        @selectionchange="onSelectionChange"
      />
    </DemoMap>
  </MapShowcase>
</template>
