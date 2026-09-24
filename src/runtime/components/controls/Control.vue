<script setup lang="ts">
import { nextTick, shallowRef, useId, useTemplateRef } from 'vue'
import { onClickOutside } from '@vueuse/core'
import type { ControlPosition, IControl } from 'maplibre-gl'
import { useControl } from '../../domains/map/control'

/** 通用控件容器：把任意 Vue 内容挂到 maplibre 控件槽位，可选折叠为图标按钮。 */
const props = withDefaults(defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /**
   * 是否使用 maplibre 控件组样式（白底圆角卡片）
   * @defaultValue true
   */
  group?: boolean
  /**
   * 是否可折叠：收起时只显示触发按钮，点击展开，面板内关闭按钮或 Esc 收起
   * @defaultValue false
   */
  collapsible?: boolean
  /**
   * 可折叠时点击控件外部是否收起；常驻展示的内容（如图例）应关闭
   * @defaultValue true
   */
  dismissible?: boolean
  /** 折叠按钮的无障碍标签 */
  label?: string
}>(), {
  group: true,
  collapsible: false,
  dismissible: true
})

defineSlots<{
  /** 控件内容；可折叠时为展开后的面板 */
  default?: () => unknown
  /** 折叠按钮内容（通常是图标） */
  trigger?: () => unknown
}>()

/** 可折叠时的展开状态 */
const open = defineModel<boolean>('open', { default: false })

const el = shallowRef<HTMLElement>()
const panelId = useId()
const trigger = useTemplateRef<HTMLButtonElement>('trigger')

function createControl(): IControl {
  let container: HTMLElement | undefined
  return {
    onAdd() {
      container = document.createElement('div')
      container.className = ['maplibregl-ctrl', props.group && 'maplibregl-ctrl-group', 'movk-maplibre-control'].filter(Boolean).join(' ')
      el.value = container
      return container
    },
    onRemove() {
      container?.remove()
      if (el.value === container) el.value = undefined
    }
  }
}

useControl(createControl, () => props.position, () => props.group)

function close(): void {
  if (!open.value) return
  open.value = false
  nextTick(() => trigger.value?.focus())
}

onClickOutside(el, () => {
  if (props.collapsible && props.dismissible && open.value) open.value = false
})

function onKeydown(event: KeyboardEvent): void {
  if (props.collapsible && event.key === 'Escape') close()
}
</script>

<template>
  <Teleport v-if="el" :to="el">
    <template v-if="collapsible">
      <button
        v-show="!open"
        ref="trigger"
        type="button"
        class="movk-maplibre-control__trigger"
        :aria-label="label"
        :title="label"
        :aria-expanded="open"
        :aria-controls="panelId"
        @click="open = true"
      >
        <slot name="trigger" />
      </button>
      <div
        v-show="open"
        :id="panelId"
        class="movk-maplibre-control__panel"
        @keydown="onKeydown"
      >
        <button
          type="button"
          class="movk-maplibre-control__close"
          aria-label="Close"
          title="Close"
          @click="close"
        >
          <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M18 6L6 18M6 6l12 12"
            />
          </svg>
        </button>
        <slot />
      </div>
    </template>
    <slot v-else />
  </Teleport>
</template>

<style>
/* 按钮样式需高于 maplibre 的 .maplibregl-ctrl-group button（固定 29px 方块），以控件类名前缀提升特异性 */
.movk-maplibre-control .movk-maplibre-control__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 29px;
  padding: 0;
  border: 0;
  background: transparent;
  color: #333;
  cursor: pointer;
}

.movk-maplibre-control .movk-maplibre-control__trigger:hover {
  background: rgb(0 0 0 / 0.05);
}

:where(.movk-maplibre-control__panel) {
  position: relative;
  padding: 8px 24px 8px 10px;
  font: 12px/20px Helvetica Neue, Arial, Helvetica, sans-serif;
  color: #333;
}
.movk-maplibre-control .movk-maplibre-control__close {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: 0;
  border-radius: 3px;
  background: transparent;
  color: #666;
  cursor: pointer;
}

.movk-maplibre-control .movk-maplibre-control__close:hover {
  background: rgb(0 0 0 / 0.05);
  color: #333;
}
</style>
