<script setup lang="ts">
import { computed, onMounted, onUnmounted, provide, ref, useId, useTemplateRef, watch, watchEffect } from 'vue'
import { clamp, omitUndefined } from '@movk/core'
import type { Map as MaplibreMap, MapOptions, StyleSpecification } from 'maplibre-gl'
import { useMap } from '../../composables/useMap'
import { createMaplibreContext, MaplibreContextKey } from '../../domains/map/context'
import { createMaplibreGl } from '../../domains/map/create-map'
import { blankStyle } from '../../domains/map/style'
import { bindSwipeOverlay } from '../../domains/map/swipe'
import { collectAttributions, isPointRevealed, positionFromPointer, swipeClipPath } from '../../utils/swipe'
import type { SwipeOrientation } from '../../utils/swipe'

const props = withDefaults(defineProps<{
  /**
   * 分隔方向：vertical 为竖直分隔条左右对比，horizontal 为水平分隔条上下对比
   * @defaultValue 'vertical'
   */
  orientation?: SwipeOrientation
  /**
   * 方向键每次移动的比例
   * @defaultValue 0.05
   */
  step?: number
  /** 对照图的底图样式（对象或样式 URL）；省略时为空白样式，由插槽内图层提供内容 */
  mapStyle?: StyleSpecification | string
}>(), {
  orientation: 'vertical',
  step: 0.05
})

defineSlots<{
  /** 对照内容：放置 MaplibreTiandituLayer、MaplibreLayer 等，作用于对照图 */
  default?: () => unknown
}>()

/** 分隔条位置，0..1 */
const position = defineModel<number>('position', { default: 0.5 })

const mainContext = useMap()
const root = useTemplateRef<HTMLDivElement>('root')
const container = useTemplateRef<HTMLDivElement>('container')

// 对照图上下文：setup 同步 provide，插槽内组件经 useMap() 作用于对照图；不进注册表
const { context, attach } = createMaplibreContext(`${mainContext.id}-swipe-${useId()}`)
provide(MaplibreContextKey, context)

const attributions = ref<string[]>([])

function revealed(point: { x: number, y: number }): boolean {
  const main = mainContext.map.value
  if (!main) return false
  const { clientWidth: width, clientHeight: height } = main.getContainer()
  return isPointRevealed(point, { width, height }, position.value, props.orientation)
}

let unbind: (() => void) | undefined
let disposed = false

onMounted(async () => {
  const main = await mainContext.whenAttached()
  if (disposed || !container.value) return
  const overlay: MaplibreMap = createMaplibreGl(omitUndefined({
    container: container.value,
    style: props.mapStyle ?? blankStyle(),
    center: main.getCenter(),
    zoom: main.getZoom(),
    bearing: main.getBearing(),
    pitch: main.getPitch(),
    interactive: false,
    attributionControl: false
  }) as MapOptions)
  attach(overlay)
  unbind = bindSwipeOverlay(main, overlay, revealed)

  const updateAttributions = (): void => {
    attributions.value = collectAttributions(overlay)
  }
  overlay.on('sourcedata', updateAttributions)
  overlay.on('style.load', updateAttributions)
})

onUnmounted(() => {
  disposed = true
  unbind?.()
  context.map.value?.remove()
})

watch(() => props.mapStyle, (style) => {
  context.map.value?.setStyle(style ?? blankStyle(), { diff: false })
})

// 只裁切对照图 canvas：对照图的 Popup/Tooltip 靠近分隔条时不被截断
watchEffect(() => {
  const overlay = context.map.value
  if (overlay) overlay.getCanvas().style.clipPath = swipeClipPath(position.value, props.orientation)
})

const offset = computed(() => `${clamp(position.value, 0, 1) * 100}%`)
const handleStyle = computed(() => ({ [props.orientation === 'vertical' ? 'left' : 'top']: offset.value }))
// 版权条停在露出区域起始角并随分隔条移动，不与主图右下角版权重叠
const attributionStyle = computed(() => props.orientation === 'vertical'
  ? { left: offset.value, bottom: '0', maxWidth: `calc(100% - ${offset.value})` }
  : { top: offset.value, left: '0' })
// 与 maplibre AttributionControl 一致以 HTML 渲染：署名来自开发者配置的样式
const attributionHtml = computed(() => attributions.value.join(' | '))

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

defineExpose({
  /** 主图容器内的点是否落在对照图露出区域，供主图侧图层事件判断互斥 */
  isPointRevealed: revealed
})
</script>

<template>
  <div
    ref="root"
    class="movk-maplibre-swipe"
    :class="`movk-maplibre-swipe--${orientation}`"
  >
    <div ref="container" class="movk-maplibre-swipe__map" />
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="attributionHtml" class="movk-maplibre-swipe__attribution" :style="attributionStyle" v-html="attributionHtml" />
    <div
      class="movk-maplibre-swipe__handle"
      :class="{ 'is-dragging': dragging }"
      :style="handleStyle"
      role="slider"
      tabindex="0"
      aria-label="Swipe position"
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
    <slot />
  </div>
</template>

<style>
/* 位于主图容器之后：压在主图画布之上、主图控件（z-index: 2）之下 */
.movk-maplibre-swipe {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.movk-maplibre-swipe > .movk-maplibre-swipe__map {
  position: absolute;
  inset: 0;
}

.movk-maplibre-swipe__attribution {
  position: absolute;
  max-width: 100%;
  padding: 0 5px;
  font: 12px/20px Helvetica Neue, Arial, Helvetica, sans-serif;
  color: rgb(0 0 0 / 0.75);
  background: rgb(255 255 255 / 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: auto;
}

.movk-maplibre-swipe__attribution a {
  color: inherit;
  text-decoration: none;
}

.movk-maplibre-swipe__handle {
  position: absolute;
  touch-action: none;
  outline: none;
  pointer-events: auto;
}

.movk-maplibre-swipe__handle::before {
  content: '';
  position: absolute;
  background: #fff;
  box-shadow: 0 0 4px rgb(0 0 0 / 0.4);
}

.movk-maplibre-swipe__handle::after {
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

.movk-maplibre-swipe__handle:focus-visible::after {
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.6);
}

.movk-maplibre-swipe--vertical > .movk-maplibre-swipe__handle {
  top: 0;
  bottom: 0;
  width: 24px;
  transform: translateX(-50%);
  cursor: ew-resize;
}

.movk-maplibre-swipe--vertical > .movk-maplibre-swipe__handle::before {
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
}

.movk-maplibre-swipe--horizontal > .movk-maplibre-swipe__handle {
  left: 0;
  right: 0;
  height: 24px;
  transform: translateY(-50%);
  cursor: ns-resize;
}

.movk-maplibre-swipe--horizontal > .movk-maplibre-swipe__handle::before {
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
}
</style>
