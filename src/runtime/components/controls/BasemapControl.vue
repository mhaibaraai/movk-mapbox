<script setup lang="ts">
import { computed, toRaw } from 'vue'
import type { ControlPosition, StyleSpecification } from 'maplibre-gl'
import type { BasemapItem } from '../../types'
import MaplibreControl from './Control.vue'

/**
 * 底图切换：受控组件，只发出选中项的 style，不直接调用 setStyle。
 * 将同一个值绑定到 MaplibreMap 的 options.style，由地图负责切换并重建叠加图层。
 */
const props = withDefaults(defineProps<{
  /** 候选底图 */
  items: BasemapItem[]
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /**
   * 折叠按钮与选项组的无障碍标签
   * @defaultValue 'Basemap'
   */
  label?: string
}>(), {
  label: 'Basemap'
})

/** 当前底图样式，与 MaplibreMap 的 options.style 绑定同一个值；按引用或字符串相等判断选中项 */
const style = defineModel<StyleSpecification | string>()
/** 面板是否展开 */
const open = defineModel<boolean>('open', { default: false })

const grid = computed(() => props.items.some(item => item.thumbnail))

// 使用方以 ref 保存样式对象时拿到的是响应式代理，按原始对象比较
function isSelected(item: BasemapItem): boolean {
  return style.value !== undefined && toRaw(item.style) === toRaw(style.value)
}
</script>

<template>
  <MaplibreControl
    v-model:open="open"
    :position="position"
    :label="label"
    collapsible
  >
    <template #trigger>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0zm.894.211v15M9 3.236v15"
        />
      </svg>
    </template>
    <div
      class="movk-maplibre-basemap-control"
      :class="{ 'movk-maplibre-basemap-control--grid': grid }"
      role="radiogroup"
      :aria-label="label"
    >
      <button
        v-for="item in items"
        :key="item.label"
        type="button"
        role="radio"
        class="movk-maplibre-basemap-control__item"
        :aria-checked="isSelected(item)"
        @click="style = item.style"
      >
        <img v-if="item.thumbnail" :src="item.thumbnail" alt="" class="movk-maplibre-basemap-control__thumbnail">
        <span>{{ item.label }}</span>
      </button>
    </div>
  </MaplibreControl>
</template>

<style>
:where(.movk-maplibre-basemap-control) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 120px;
}

:where(.movk-maplibre-basemap-control--grid) {
  display: grid;
  grid-template-columns: repeat(2, 72px);
  gap: 6px;
}

.movk-maplibre-control .movk-maplibre-basemap-control__item {
  display: flex;
  width: 100%;
  height: auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 3px 6px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.movk-maplibre-control .movk-maplibre-basemap-control__item:hover {
  background: rgb(0 0 0 / 0.05);
}

.movk-maplibre-control .movk-maplibre-basemap-control__item[aria-checked='true'] {
  border-color: #3b82f6;
  color: #1d4ed8;
}

.movk-maplibre-control .movk-maplibre-basemap-control--grid .movk-maplibre-basemap-control__item {
  align-items: center;
  padding: 3px;
}

:where(.movk-maplibre-basemap-control__thumbnail) {
  width: 64px;
  height: 48px;
  border-radius: 3px;
  object-fit: cover;
}
</style>
