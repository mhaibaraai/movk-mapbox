<script setup lang="ts">
import { onMounted, onUnmounted, ref, useSlots, useTemplateRef, watch } from 'vue'
import { Marker } from 'mapbox-gl'
import type { LngLatLike, MarkerOptions, PopupOptions } from 'mapbox-gl'
import { useMap } from '../composables/useMap'
import type { PopupTrigger } from '../types'
import MapboxPopup from './Popup.vue'

const props = withDefaults(defineProps<{
  /**
   * 标记选项；element 由默认插槽提供，无需在此传入
   * @see https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker
   */
  options?: Omit<MarkerOptions, 'element'>
  /**
   * 弹窗选项，仅在提供 #popup 插槽时生效
   * @see https://docs.mapbox.com/mapbox-gl-js/api/markers/#popup
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
let unbindTrigger: (() => void) | undefined

function openPopup(): void {
  open.value = true
}

function closePopup(): void {
  open.value = false
}

function togglePopup(): void {
  open.value = !open.value
}

// marker 元素挂在 canvasContainer 内，点击会冒泡到地图并触发 mapbox 的 preclick。
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

onMounted(async () => {
  const map = await ctx.whenLoaded()
  const useSlot = Boolean(slots.default && el.value)
  marker = new Marker({ ...props.options, ...(useSlot ? { element: el.value! } : {}) })
  marker.setLngLat(lnglat.value).addTo(map)
  ready.value = true
  bindTrigger()

  if (props.options?.draggable) {
    marker.on('dragend', () => {
      const { lng, lat } = marker!.getLngLat()
      lnglat.value = [lng, lat]
    })
  }
})

watch(lnglat, (value) => {
  if (value) marker?.setLngLat(value)
})

watch(() => props.trigger, bindTrigger)

onUnmounted(() => {
  unbindTrigger?.()
  marker?.remove()
})

defineExpose({ marker: () => marker })
</script>

<template>
  <div v-if="$slots.default" ref="el" :style="{ visibility: ready ? undefined : 'hidden' }">
    <slot />
  </div>
  <MapboxPopup
    v-if="$slots.popup && open"
    :lnglat="lnglat"
    :options="popupOptions"
    @close="closePopup"
  >
    <slot name="popup" :close="closePopup" />
  </MapboxPopup>
</template>
