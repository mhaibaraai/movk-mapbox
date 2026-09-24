<script setup lang="ts">
import { computed } from 'vue'
import type { ControlPosition } from 'maplibre-gl'
import { useLayerTree } from '../../composables/useLayerTree'
import type { LayerTreeItem, LegendItem } from '../../types'
import MaplibreControl from './Control.vue'

/** 图例：展示可见图层组的图例项，图例来自 MaplibreLayerGroup 的 legend 或子图层颜色推导。 */
const props = withDefaults(defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /** 只展示这些标题的图层组；省略展示全部 */
  groups?: string[]
  /**
   * 是否可折叠
   * @defaultValue true
   */
  collapsible?: boolean
  /**
   * 折叠按钮与图例列表的无障碍标签
   * @defaultValue 'Legend'
   */
  label?: string
}>(), {
  collapsible: true,
  label: 'Legend'
})

defineSlots<{
  /** 自定义单个图例项 */
  item?: (props: { item: LegendItem, group: LayerTreeItem }) => unknown
}>()

/** 可折叠时的展开状态 */
const open = defineModel<boolean>('open', { default: true })

const tree = useLayerTree()

const entries = computed(() => tree.value.filter(group =>
  group.visible
  && group.legend.length > 0
  && (!props.groups || props.groups.includes(group.title))
))

// 单项且标签即组标题时合并为一行，不再重复标题
function isSingle(group: LayerTreeItem): boolean {
  return group.legend.length === 1 && group.legend[0]!.label === group.title
}

function swatchStyle(item: LegendItem): Record<string, string> {
  if (item.type === 'gradient') return { background: `linear-gradient(to right, ${(item.colors ?? []).join(', ')})` }
  return { background: item.color ?? 'transparent' }
}
</script>

<template>
  <MaplibreControl
    v-model:open="open"
    :position="position"
    :label="label"
    :collapsible="collapsible"
    :dismissible="false"
  >
    <template #trigger>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M3 5h.01M3 12h.01M3 19h.01M8 5h13M8 12h13M8 19h13"
        />
      </svg>
    </template>
    <div class="movk-maplibre-legend" :aria-label="label">
      <section v-for="group in entries" :key="group.id" class="movk-maplibre-legend__group">
        <p v-if="!isSingle(group)" class="movk-maplibre-legend__heading">
          {{ group.title }}
        </p>
        <div v-for="item in group.legend" :key="`${item.label}-${item.color ?? item.colors?.join()}`" class="movk-maplibre-legend__row">
          <slot name="item" :item="item" :group="group">
            <span
              class="movk-maplibre-legend__swatch"
              :class="`movk-maplibre-legend__swatch--${item.type}`"
              :style="swatchStyle(item)"
              aria-hidden="true"
            />
            <span>{{ item.label }}</span>
          </slot>
        </div>
      </section>
    </div>
  </MaplibreControl>
</template>

<style>
:where(.movk-maplibre-legend) {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
}

:where(.movk-maplibre-legend__heading) {
  margin: 0;
  font-weight: 600;
}

:where(.movk-maplibre-legend__row) {
  display: flex;
  align-items: center;
  gap: 6px;
}

:where(.movk-maplibre-legend__swatch) {
  flex: none;
  width: 14px;
  height: 14px;
  border-radius: 2px;
}

:where(.movk-maplibre-legend__swatch--line) {
  height: 3px;
  border-radius: 2px;
}

:where(.movk-maplibre-legend__swatch--circle) {
  width: 10px;
  height: 10px;
  margin: 0 2px;
  border-radius: 9999px;
}

:where(.movk-maplibre-legend__swatch--gradient) {
  width: 48px;
  height: 10px;
}
</style>
