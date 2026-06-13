<script setup lang="ts">
import { omitUndefined } from '@movk/core'
import { NavigationControl } from 'mapbox-gl'
import type { ControlPosition } from 'mapbox-gl'
import { useControl } from '../../domains/map/control'

const props = defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /**
   * NavigationControl 构造选项
   * @see https://docs.mapbox.com/mapbox-gl-js/api/markers/#navigationcontrol
   */
  options?: ConstructorParameters<typeof NavigationControl>[0]
}>()

useControl(
  () => new NavigationControl(omitUndefined(props.options ?? {})),
  () => props.position,
  () => props.options
)
</script>

<template>
  <slot />
</template>
