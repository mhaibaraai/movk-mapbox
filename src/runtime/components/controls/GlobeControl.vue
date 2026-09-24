<script setup lang="ts">
import { GlobeControl } from 'maplibre-gl'
import type { ControlPosition } from 'maplibre-gl'
import { useControl } from '../../domains/map/control'

const props = defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
}>()

useControl(
  () => new GlobeControl(),
  () => props.position
)
</script>

<template>
  <slot />
</template>
