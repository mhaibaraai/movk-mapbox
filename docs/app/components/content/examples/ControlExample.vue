<script setup lang="ts">
const zoom = ref(11)
</script>

<template>
  <div class="h-115 w-full overflow-hidden rounded-(--ui-radius) border border-default">
    <MaplibreMap v-model:zoom="zoom" :options="{ style: 'https://tiles.openfreemap.org/styles/liberty', center: [116.397, 39.908] }">
      <!-- 常驻控件：任意 Vue 内容，可直接读取响应式状态 -->
      <MaplibreControl position="top-left">
        <div class="px-2 py-1 text-xs tabular-nums">
          Zoom {{ zoom.toFixed(1) }}
        </div>
      </MaplibreControl>
      <!-- 可折叠控件：收起为图标按钮，点击展开 -->
      <MaplibreControl position="top-right" collapsible label="说明">
        <template #trigger>
          <UIcon name="i-lucide-info" class="size-4" />
        </template>
        <p class="w-44 text-xs">
          MaplibreControl 把任意 Vue 内容放进地图控件槽位，点击外部、按 Esc 或右上角按钮收起。
        </p>
      </MaplibreControl>
    </MaplibreMap>
  </div>
</template>
