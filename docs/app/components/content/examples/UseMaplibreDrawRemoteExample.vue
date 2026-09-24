<script setup lang="ts">
import type { Feature } from 'geojson'

const MAP_ID = 'docs-draw-remote'

const features = ref<Feature[]>([])
const mode = ref('select')

// 工具栏位于 <MaplibreMap> 之外，按 mapId 查注册表驱动绘制
const { changeMode, deleteAll } = useMaplibreDraw({ mapId: MAP_ID })
</script>

<template>
  <div class="flex flex-col gap-2 w-full">
    <div class="flex flex-wrap gap-1">
      <UButton size="xs" variant="soft" @click="changeMode('point')">
        画点
      </UButton>
      <UButton size="xs" variant="soft" @click="changeMode('linestring')">
        画线
      </UButton>
      <UButton size="xs" variant="soft" @click="changeMode('polygon')">
        画面
      </UButton>
      <UButton size="xs" color="error" variant="soft" :disabled="!features.length" @click="deleteAll">
        清空
      </UButton>
      <span class="ml-auto self-center text-xs text-muted">
        模式 {{ mode }}，已绘制 {{ features.length }} 个要素
      </span>
    </div>

    <MaplibreMap
      class="h-115"
      :map-id="MAP_ID"
      :options="{ style: 'https://tiles.openfreemap.org/styles/positron', center: [116.397, 39.908], zoom: 11 }"
    >
      <MaplibreDrawControl
        v-model:features="features"
        v-model:mode="mode"
        position="top-left"
        :modes="['select', 'point', 'linestring', 'polygon']"
      />
    </MaplibreMap>
  </div>
</template>
