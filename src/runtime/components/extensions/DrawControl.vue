<script setup lang="ts">
import { onMounted, onUnmounted, provide, shallowRef } from 'vue'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { ControlPosition } from 'mapbox-gl'
import type { Feature } from 'geojson'
import { useMap } from '../../composables/useMap'
import { DrawKey } from '../../domains/map/draw'

const props = defineProps<{
  position?: ControlPosition
  options?: ConstructorParameters<typeof MapboxDraw>[0]
}>()

const emit = defineEmits<{
  create: [features: Feature[]]
  update: [features: Feature[]]
  delete: [features: Feature[]]
  selectionchange: [features: Feature[]]
  modechange: [mode: string]
}>()

const ctx = useMap()
const draw = shallowRef<MapboxDraw>()
provide(DrawKey, draw)

// 持有 [事件名, handler] 以便卸载时逐个解绑，避免监听残留
let listeners: [string, (e: never) => void][] = []

onMounted(async () => {
  const map = await ctx.whenLoaded()
  const instance = new MapboxDraw(props.options)
  map.addControl(instance as never, props.position)
  draw.value = instance

  listeners = [
    ['draw.create', (e: { features: Feature[] }) => emit('create', e.features)],
    ['draw.update', (e: { features: Feature[] }) => emit('update', e.features)],
    ['draw.delete', (e: { features: Feature[] }) => emit('delete', e.features)],
    ['draw.selectionchange', (e: { features: Feature[] }) => emit('selectionchange', e.features)],
    ['draw.modechange', (e: { mode: string }) => emit('modechange', e.mode)]
  ] as [string, (e: never) => void][]

  for (const [type, handler] of listeners) map.on(type as never, handler)
})

onUnmounted(() => {
  const map = ctx.map.value
  if (!map) return
  for (const [type, handler] of listeners) map.off(type as never, handler)
  listeners = []
  if (draw.value) map.removeControl(draw.value as never)
})

defineExpose({ draw: () => draw.value })
</script>

<template>
  <slot />
</template>
