<script setup lang="ts">
import { computed, ref, useTemplateRef } from 'vue'
import { clamp } from '@movk/core'
import { useMapSync } from '../../composables/useMapSync'
import { MapGroupSlot, useMapGroupSlot } from '../../domains/map/group'
import { compareClipPath, positionFromPointer } from '../../utils/compare'
import type { CompareOrientation } from '../../utils/compare'

const props = withDefaults(defineProps<{
  /**
   * 分隔方向：vertical 为竖直分隔条左右对比，horizontal 为水平分隔条上下对比
   * @defaultValue 'vertical'
   */
  orientation?: CompareOrientation
  /**
   * 是否联动两张地图的相机
   * @defaultValue true
   */
  sync?: boolean
  /**
   * 方向键每次移动的比例
   * @defaultValue 0.05
   */
  step?: number
}>(), {
  orientation: 'vertical',
  sync: true,
  step: 0.05
})

defineSlots<{
  /** 前图（左侧或上侧），放置一个 MaplibreMap */
  before?: () => unknown
  /** 后图（右侧或下侧），放置一个 MaplibreMap */
  after?: () => unknown
}>()

/** 分隔条位置，0..1 */
const position = defineModel<number>('position', { default: 0.5 })

const root = useTemplateRef<HTMLDivElement>('root')
const before = useMapGroupSlot()
const after = useMapGroupSlot()

useMapSync(
  () => [before.context.value, after.context.value].filter(context => context !== undefined),
  { enabled: () => props.sync }
)

const clipPath = computed(() => compareClipPath(position.value, props.orientation))
const handleStyle = computed(() => ({
  [props.orientation === 'vertical' ? 'left' : 'top']: `${clamp(position.value, 0, 1) * 100}%`
}))

const dragging = ref(false)

function updateFromPointer(event: PointerEvent): void {
  if (!root.value) return
  position.value = positionFromPointer(
    root.value.getBoundingClientRect(),
    { x: event.clientX, y: event.clientY },
    props.orientation
  )
}

function onPointerDown(event: PointerEvent): void {
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  updateFromPointer(event)
}

function onPointerMove(event: PointerEvent): void {
  if (dragging.value) updateFromPointer(event)
}

function onPointerUp(): void {
  dragging.value = false
}

const KEY_DELTA: Record<string, number> = {
  ArrowLeft: -1,
  ArrowUp: -1,
  ArrowRight: 1,
  ArrowDown: 1
}

function onKeydown(event: KeyboardEvent): void {
  let next: number | undefined
  if (event.key === 'Home') next = 0
  else if (event.key === 'End') next = 1
  else if (event.key in KEY_DELTA) next = position.value + KEY_DELTA[event.key]! * props.step
  if (next === undefined) return
  event.preventDefault()
  position.value = clamp(next, 0, 1)
}
</script>

<template>
  <div
    ref="root"
    class="movk-maplibre-compare"
    :class="`movk-maplibre-compare--${orientation}`"
  >
    <MapGroupSlot class="movk-maplibre-compare__before" :register="before.register">
      <slot name="before" />
    </MapGroupSlot>
    <MapGroupSlot class="movk-maplibre-compare__after" :style="{ clipPath }" :register="after.register">
      <slot name="after" />
    </MapGroupSlot>
    <div
      class="movk-maplibre-compare__handle"
      :class="{ 'is-dragging': dragging }"
      :style="handleStyle"
      role="slider"
      tabindex="0"
      aria-label="Compare position"
      :aria-orientation="orientation === 'vertical' ? 'horizontal' : 'vertical'"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Math.round(clamp(position, 0, 1) * 100)"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerUp"
      @keydown="onKeydown"
    />
  </div>
</template>

<style>
@layer components {
  :where(.movk-maplibre-compare) {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}

.movk-maplibre-compare > .movk-maplibre-compare__before,
.movk-maplibre-compare > .movk-maplibre-compare__after {
  position: absolute;
  inset: 0;
}

.movk-maplibre-compare__handle {
  position: absolute;
  z-index: 3;
  touch-action: none;
  outline: none;
}

.movk-maplibre-compare__handle::before {
  content: '';
  position: absolute;
  background: #fff;
  box-shadow: 0 0 4px rgb(0 0 0 / 0.4);
}

.movk-maplibre-compare__handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 28px;
  height: 28px;
  border-radius: 9999px;
  background: #fff;
  box-shadow: 0 1px 4px rgb(0 0 0 / 0.4);
  transform: translate(-50%, -50%);
}

.movk-maplibre-compare__handle:focus-visible::after {
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.6);
}

.movk-maplibre-compare--vertical > .movk-maplibre-compare__handle {
  top: 0;
  bottom: 0;
  width: 24px;
  transform: translateX(-50%);
  cursor: ew-resize;
}

.movk-maplibre-compare--vertical > .movk-maplibre-compare__handle::before {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
}

.movk-maplibre-compare--horizontal > .movk-maplibre-compare__handle {
  left: 0;
  right: 0;
  height: 24px;
  transform: translateY(-50%);
  cursor: ns-resize;
}

.movk-maplibre-compare--horizontal > .movk-maplibre-compare__handle::before {
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
}
</style>
