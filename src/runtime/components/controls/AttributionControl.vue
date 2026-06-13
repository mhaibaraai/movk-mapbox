<script setup lang="ts">
import { omitUndefined } from '@movk/core'
import { AttributionControl } from 'mapbox-gl'
import type { ControlPosition } from 'mapbox-gl'
import { useControl } from '../../domains/map/control'

const props = defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /**
   * AttributionControl 构造选项
   * @see https://docs.mapbox.com/mapbox-gl-js/api/markers/#attributioncontrol
   */
  options?: ConstructorParameters<typeof AttributionControl>[0]
}>()

useControl(
  () => new AttributionControl(omitUndefined(props.options ?? {})),
  () => props.position,
  () => props.options
)
</script>

<template>
  <slot />
</template>
