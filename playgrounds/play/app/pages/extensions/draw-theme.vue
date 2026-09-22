<script setup lang="ts">
import type { Feature } from 'geojson'

const drawRef = ref<{ setFeatureProperty: (id: string | number, key: string, value: unknown) => Promise<void> }>()
const features = ref<Feature[]>([])
const selectedId = ref<string | number>()

// 主题色为缺省配色，要素 properties.color 优先覆盖
const theme = { color: '#3b82f6', activeColor: '#f59e0b' } as const

const swatches = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899']

function onDeselect(id: string | number) {
  if (selectedId.value === id) selectedId.value = undefined
}

function applyColor(color: string) {
  if (selectedId.value) drawRef.value?.setFeatureProperty(selectedId.value, 'color', color)
}

const state = computed(() => ({
  selected: selectedId.value ?? null,
  colors: features.value.map(f => f.properties?.color ?? null)
}))
</script>

<template>
  <MapShowcase
    title="Draw 样式主题"
    description="theme 设置缺省配色：绘制后选中要素，点色块经 setFeatureProperty 写入 color 实时改色。"
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
      <MaplibreDrawControl
        ref="drawRef"
        v-model:features="features"
        position="top-left"
        :controls="['point', 'linestring', 'polygon']"
        :theme="theme"
        @select="selectedId = $event"
        @deselect="onDeselect"
      />
    </DemoMap>
  </MapShowcase>
</template>
