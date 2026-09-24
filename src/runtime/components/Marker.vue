<script setup lang="ts">
import { onMounted, onUnmounted, ref, useSlots, useTemplateRef, watch } from 'vue'
import { Marker } from 'maplibre-gl'
import type { LngLatLike, Map as MaplibreMap, MarkerOptions, PopupOptions } from 'maplibre-gl'
import { useMap } from '../composables/useMap'
import { isDeepEqual } from '../utils/equal'
import { applyMarkerOptions, markerNeedsRebuild, removeMarkerClassName } from '../utils/marker'
import type { MarkerInputOptions } from '../utils/marker'
import type { PopupTrigger } from '../types'
import MaplibrePopup from './Popup.vue'

const props = withDefaults(defineProps<{
  /**
   * 标记选项；element 由默认插槽提供，无需在此传入。
   * 有 setter 的字段（rotation、draggable 等）增量更新，anchor、color、scale 变化时重建
   * @see https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MarkerOptions/
   */
  options?: Omit<MarkerOptions, 'element'>
  /**
   * 弹窗选项，仅在提供 #popup 插槽时生效
   * @see https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/PopupOptions/
   */
  popupOptions?: PopupOptions
  /**
   * #popup 插槽的触发时机；'none' 表示不绑定监听，完全由 v-model:open 受控
   * @defaultValue 'click'
   */
  trigger?: PopupTrigger
}>(), {
  trigger: 'click'
})

// 位置双向绑定：draggable 时拖拽结束回写
const lnglat = defineModel<LngLatLike>('lnglat', { required: true })
/** 弹窗开合状态；初始传 true 即默认展开 */
const open = defineModel<boolean>('open', { default: false })

const ctx = useMap()
const slots = useSlots()
const el = useTemplateRef<HTMLDivElement>('el')
// 定位完成前隐藏插槽元素，避免初始化时先停在文档流位置（地图左上角）再跳到目标点
const ready = ref(false)
let marker: Marker | undefined
// 当前实例已生效的选项，作为增量比较的基准
let applied: MarkerInputOptions = {}
let unbindTrigger: (() => void) | undefined
let disposed = false

function openPopup(): void {
  open.value = true
}

function closePopup(): void {
  open.value = false
}

function togglePopup(): void {
  open.value = !open.value
}

// marker 元素挂在 canvasContainer 内，点击会冒泡到地图并触发 maplibre 的 preclick。
// 浏览器在每个监听器返回后都会跑微任务检查点，popup 已在本次点击继续冒泡前挂载完成，
// 于是被 preclick 上的 closeOnClick 当场关闭。阻断冒泡让本次点击不抵达地图。
function onElementClick(event: MouseEvent): void {
  event.stopPropagation()
  togglePopup()
}

// 监听绑定在 marker 元素上：自定义插槽元素与原生水滴 pin 均适用
function bindTrigger(): void {
  unbindTrigger?.()
  unbindTrigger = undefined
  if (!marker || !slots.popup || props.trigger === 'none') return

  const element = marker.getElement()
  if (props.trigger === 'click') {
    element.addEventListener('click', onElementClick)
    unbindTrigger = () => element.removeEventListener('click', onElementClick)
    return
  }
  element.addEventListener('mouseenter', openPopup)
  element.addEventListener('mouseleave', closePopup)
  unbindTrigger = () => {
    element.removeEventListener('mouseenter', openPopup)
    element.removeEventListener('mouseleave', closePopup)
  }
}

function onDragEnd(): void {
  if (!marker) return
  const { lng, lat } = marker.getLngLat()
  lnglat.value = [lng, lat]
}

function createMarker(map: MaplibreMap): void {
  const useSlot = Boolean(slots.default && el.value)
  applied = { ...props.options }
  marker = new Marker({ ...applied, ...(useSlot ? { element: el.value! } : {}) })
  marker.setLngLat(lnglat.value).addTo(map)
  // draggable 可能在运行时开启，dragend 无条件绑定
  marker.on('dragend', onDragEnd)
  bindTrigger()
}

onMounted(async () => {
  const map = await ctx.whenAttached()
  if (disposed) return
  createMarker(map)
  ready.value = true
})

// 模板内联对象每次渲染都是新引用，值相同时跳过
watch(() => props.options, (value) => {
  const map = ctx.map.value
  const next = value ?? {}
  if (!marker || !map || isDeepEqual(next, applied)) return
  if (markerNeedsRebuild(next, applied)) {
    // 插槽元素复用于新实例，先清掉旧 className
    removeMarkerClassName(marker, applied.className)
    unbindTrigger?.()
    marker.remove()
    createMarker(map)
    return
  }
  applyMarkerOptions(marker, next, applied)
  applied = { ...next }
})

watch(lnglat, (value) => {
  if (value) marker?.setLngLat(value)
})

watch(() => props.trigger, bindTrigger)

onUnmounted(() => {
  disposed = true
  unbindTrigger?.()
  marker?.remove()
})

defineExpose({ marker: () => marker })
</script>

<template>
  <div v-if="$slots.default" ref="el" :style="{ visibility: ready ? undefined : 'hidden' }">
    <slot />
  </div>
  <MaplibrePopup
    v-if="$slots.popup && open"
    :lnglat="lnglat"
    :options="popupOptions"
    @close="closePopup"
  >
    <slot name="popup" :close="closePopup" />
  </MaplibrePopup>
</template>
