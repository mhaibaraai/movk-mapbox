<script setup lang="ts">
import { omitUndefined } from '@movk/core'
import { FullscreenControl } from 'mapbox-gl'
import type { ControlPosition } from 'mapbox-gl'
import { useControl } from '../../domains/map/control'

const props = defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /**
   * FullscreenControl 构造选项
   * @see https://docs.mapbox.com/mapbox-gl-js/api/markers/#fullscreencontrol
   */
  options?: ConstructorParameters<typeof FullscreenControl>[0]
}>()

useControl(() => new FullscreenControl(omitUndefined(props.options ?? {})), props.position)
</script>

<template>
  <slot />
</template>
