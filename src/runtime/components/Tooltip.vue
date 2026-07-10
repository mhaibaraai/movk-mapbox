<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, useTemplateRef, watch } from 'vue'
import { Popup } from 'mapbox-gl'
import type { GeoJSONFeature, Map as MapboxMap, MapMouseEvent, PopupOptions } from 'mapbox-gl'
import { useMap } from '../composables/useMap'
import type { PopupTrigger } from '../types'

/** 目标图层要素的弹窗：按 trigger 以悬浮或点击触发，作用域插槽拿到当前要素。 */
const props = withDefaults(defineProps<{
  /** 目标图层 id */
  layerId: string
  /**
   * Popup 选项（hover 模式下 closeButton/closeOnClick 由组件接管）
   * @see https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
   */
  options?: PopupOptions
  /**
   * 悬浮时鼠标指针样式
   * @defaultValue 'pointer'
   */
  cursor?: string
  /**
   * 触发时机；'none' 表示不绑定任何监听，可用于临时停用
   * @defaultValue 'hover'
   */
  trigger?: PopupTrigger
}>(), {
  cursor: 'pointer',
  trigger: 'hover'
})

const ctx = useMap()
const el = useTemplateRef<HTMLDivElement>('el')
const hovered = shallowRef<GeoJSONFeature>()
let popup: Popup | undefined
let unbind: (() => void) | undefined

type LayerMouseEvent = MapMouseEvent & { features?: GeoJSONFeature[] }

function setCursor(value: string): void {
  const map = ctx.map.value
  if (map) map.getCanvas().style.cursor = value
}

function show(event: LayerMouseEvent): void {
  const map = ctx.map.value
  if (!map || !popup || !el.value) return
  hovered.value = event.features?.[0]
  popup.setLngLat(event.lngLat).setDOMContent(el.value)
  if (!popup.isOpen()) popup.addTo(map)
}

function close(): void {
  hovered.value = undefined
  popup?.remove()
}

function onMove(event: LayerMouseEvent): void {
  setCursor(props.cursor)
  show(event)
}

function onLeave(): void {
  setCursor('')
  close()
}

function onClick(event: LayerMouseEvent): void {
  show(event)
}

function onEnter(): void {
  setCursor(props.cursor)
}

function onLeaveCursor(): void {
  setCursor('')
}

// hover 下弹窗随指针来去，接管关闭行为；click 下需要关闭按钮，
// 但不能默认 closeOnClick——否则会被开启它的那一次 click 派发立即关闭
function popupOptions(): PopupOptions {
  return props.trigger === 'hover'
    ? { ...props.options, closeButton: false, closeOnClick: false }
    : { closeButton: true, closeOnClick: false, ...props.options }
}

// 按 layerId 委托到地图级监听，目标图层晚于本组件挂载也能命中
function bind(map: MapboxMap): void {
  if (props.trigger === 'none') return

  if (props.trigger === 'hover') {
    map.on('mousemove', props.layerId, onMove)
    map.on('mouseleave', props.layerId, onLeave)
    unbind = () => {
      map.off('mousemove', props.layerId, onMove)
      map.off('mouseleave', props.layerId, onLeave)
    }
    return
  }

  map.on('click', props.layerId, onClick)
  map.on('mouseenter', props.layerId, onEnter)
  map.on('mouseleave', props.layerId, onLeaveCursor)
  unbind = () => {
    map.off('click', props.layerId, onClick)
    map.off('mouseenter', props.layerId, onEnter)
    map.off('mouseleave', props.layerId, onLeaveCursor)
  }
}

function teardown(): void {
  unbind?.()
  unbind = undefined
  setCursor('')
  popup?.remove()
  popup = undefined
}

function setup(map: MapboxMap): void {
  popup = new Popup(popupOptions())
  popup.on('close', () => (hovered.value = undefined))
  bind(map)
}

onMounted(async () => {
  const map = await ctx.whenLoaded()
  setup(map)
})

// trigger 变更需重建 popup：其 closeButton 等选项在构造时确定
watch(() => props.trigger, () => {
  const map = ctx.map.value
  if (!map) return
  teardown()
  setup(map)
})

onUnmounted(teardown)

defineExpose({
  /** 当前激活要素 */
  hovered: () => hovered.value
})
</script>

<template>
  <div style="display: none">
    <div ref="el">
      <slot :feature="hovered" :close="close" />
    </div>
  </div>
</template>
