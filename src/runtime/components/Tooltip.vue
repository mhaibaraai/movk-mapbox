<script setup lang="ts">
import { onMounted, onUnmounted, shallowRef, useTemplateRef } from 'vue'
import { Popup } from 'mapbox-gl'
import type { GeoJSONFeature, MapMouseEvent, PopupOptions } from 'mapbox-gl'
import { useMap } from '../composables/useMap'

/** Popup 的 hover 模式：悬浮目标图层要素时跟随显示，移出即消失。 */
const props = withDefaults(defineProps<{
  /** 目标图层 id */
  layerId: string
  /** Popup 选项（closeButton/closeOnClick 由组件接管） */
  options?: PopupOptions
  /** 悬浮时鼠标指针样式，默认 pointer */
  cursor?: string
}>(), {
  cursor: 'pointer'
})

const ctx = useMap()
const el = useTemplateRef<HTMLDivElement>('el')
const hovered = shallowRef<GeoJSONFeature>()
let popup: Popup | undefined
let bound = false

type LayerMouseEvent = MapMouseEvent & { features?: GeoJSONFeature[] }

function onMove(event: LayerMouseEvent): void {
  const map = ctx.map.value
  if (!map || !popup || !el.value) return
  hovered.value = event.features?.[0]
  map.getCanvas().style.cursor = props.cursor
  popup.setLngLat(event.lngLat).setDOMContent(el.value)
  if (!popup.isOpen()) popup.addTo(map)
}

function onLeave(): void {
  const map = ctx.map.value
  if (map) map.getCanvas().style.cursor = ''
  hovered.value = undefined
  popup?.remove()
}

onMounted(async () => {
  const map = await ctx.whenLoaded()
  popup = new Popup({ ...props.options, closeButton: false, closeOnClick: false })
  // 按 layerId 委托到地图级监听，目标图层晚于本组件挂载也能命中
  map.on('mousemove', props.layerId, onMove)
  map.on('mouseleave', props.layerId, onLeave)
  bound = true
})

onUnmounted(() => {
  const map = ctx.map.value
  if (map && bound) {
    map.off('mousemove', props.layerId, onMove)
    map.off('mouseleave', props.layerId, onLeave)
    map.getCanvas().style.cursor = ''
  }
  popup?.remove()
})

defineExpose({
  /** 当前悬浮要素 */
  hovered: () => hovered.value
})
</script>

<template>
  <div style="display: none">
    <div ref="el">
      <slot :feature="hovered" />
    </div>
  </div>
</template>
