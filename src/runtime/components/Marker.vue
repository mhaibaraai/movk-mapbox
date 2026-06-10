<script setup lang="ts">
import { onMounted, onUnmounted, useSlots, useTemplateRef, watch } from 'vue'
import { Marker } from 'mapbox-gl'
import type { LngLatLike, MarkerOptions } from 'mapbox-gl'
import { useMap } from '../composables/useMap'

const props = defineProps<{
  /** 标记选项；element 由默认插槽提供，无需在此传入 */
  options?: Omit<MarkerOptions, 'element'>
}>()

// 位置双向绑定：draggable 时拖拽结束回写
const lnglat = defineModel<LngLatLike>('lnglat', { required: true })

const ctx = useMap()
const slots = useSlots()
const el = useTemplateRef<HTMLDivElement>('el')
let marker: Marker | undefined

onMounted(async () => {
  const map = await ctx.whenLoaded()
  const useSlot = Boolean(slots.default && el.value)
  marker = new Marker({ ...props.options, ...(useSlot ? { element: el.value! } : {}) })
  marker.setLngLat(lnglat.value).addTo(map)

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

onUnmounted(() => marker?.remove())

defineExpose({ marker: () => marker })
</script>

<template>
  <div v-if="$slots.default" ref="el">
    <slot />
  </div>
</template>
