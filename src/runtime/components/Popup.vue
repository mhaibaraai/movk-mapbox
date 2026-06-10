<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import { Popup } from 'mapbox-gl'
import type { LngLatLike, PopupOptions } from 'mapbox-gl'
import { useMap } from '../composables/useMap'

const props = defineProps<{
  lnglat: LngLatLike
  options?: PopupOptions
}>()

const emit = defineEmits<{ close: [] }>()

const ctx = useMap()
const el = useTemplateRef<HTMLDivElement>('el')
let popup: Popup | undefined

onMounted(async () => {
  const map = await ctx.whenLoaded()
  popup = new Popup(props.options)
  popup.setLngLat(props.lnglat)
  if (el.value) popup.setDOMContent(el.value)
  popup.on('close', () => emit('close'))
  popup.addTo(map)
})

watch(() => props.lnglat, value => popup?.setLngLat(value))

onUnmounted(() => popup?.remove())

defineExpose({ popup: () => popup })
</script>

<template>
  <div ref="el">
    <slot />
  </div>
</template>
