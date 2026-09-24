<script setup lang="ts">
import type { ControlPosition } from 'maplibre-gl'
import { useLayerTree } from '../../composables/useLayerTree'
import type { LayerTreeItem } from '../../types'
import MaplibreControl from './Control.vue'

/** 图层控件：列出带 title 的 MaplibreLayerGroup，勾选控制显隐、滑块控制透明度，读写即写回各组的 v-model。 */
const props = withDefaults(defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /**
   * 是否显示透明度滑块
   * @defaultValue true
   */
  opacity?: boolean
  /**
   * 折叠按钮的无障碍标签
   * @defaultValue 'Layers'
   */
  label?: string
}>(), {
  opacity: true,
  label: 'Layers'
})

defineSlots<{
  /** 自定义单个图层组的行内容 */
  item?: (props: { item: LayerTreeItem }) => unknown
}>()

/** 面板是否展开 */
const open = defineModel<boolean>('open', { default: false })

const items = useLayerTree()

function onToggle(item: LayerTreeItem, event: Event): void {
  item.setVisible((event.target as HTMLInputElement).checked)
}

function onOpacity(item: LayerTreeItem, event: Event): void {
  item.setOpacity(Number((event.target as HTMLInputElement).value))
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
        <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">
          <path d="M12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83z" />
          <path d="M2 12a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 12" />
          <path d="M2 17a1 1 0 0 0 .58.91l8.6 3.91a2 2 0 0 0 1.65 0l8.58-3.9A1 1 0 0 0 22 17" />
        </g>
      </svg>
    </template>
    <ul class="movk-maplibre-layer-control" :aria-label="label">
      <li v-for="item in items" :key="item.id" class="movk-maplibre-layer-control__item">
        <slot name="item" :item="item">
          <label class="movk-maplibre-layer-control__toggle">
            <input type="checkbox" :checked="item.visible" @change="onToggle(item, $event)">
            <span class="movk-maplibre-layer-control__title">{{ item.title }}</span>
          </label>
          <input
            v-if="props.opacity"
            class="movk-maplibre-layer-control__opacity"
            type="range"
            min="0"
            max="1"
            step="0.05"
            :value="item.opacity"
            :disabled="!item.visible"
            :aria-label="`${item.title} opacity`"
            @input="onOpacity(item, $event)"
          >
        </slot>
      </li>
    </ul>
  </MaplibreControl>
</template>

<style>
:where(.movk-maplibre-layer-control) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
  margin: 0;
  padding: 0;
  list-style: none;
}

:where(.movk-maplibre-layer-control__toggle) {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

:where(.movk-maplibre-layer-control__opacity) {
  display: block;
  width: 100%;
  margin: 2px 0 0;
}
</style>
