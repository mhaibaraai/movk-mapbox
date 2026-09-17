<script setup lang="ts">
import { omitUndefined } from '@movk/core'
import { ScaleControl } from 'maplibre-gl'
import type { ControlPosition } from 'maplibre-gl'
import { useControl } from '../../domains/map/control'

const props = defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /**
   * ScaleControl 构造选项
   * @see https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/ScaleControlOptions/
   */
  options?: ConstructorParameters<typeof ScaleControl>[0]
}>()

useControl(
  () => new ScaleControl(omitUndefined(props.options ?? {})),
  () => props.position,
  () => props.options
)
</script>

<template>
  <slot />
</template>
