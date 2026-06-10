<script setup lang="ts">
import type { RainSpecification } from 'mapbox-gl'
import { useStyleEffect } from '../../domains/map/style-effect'

// mapbox setRain 为实验性 API，未来版本可能变更
const props = defineProps<{
  /** 降雨效果选项；缺省 {} 使用默认雨效 */
  options?: RainSpecification
}>()

useStyleEffect(
  () => props.options,
  (map, value) => map.setRain(value ?? {}),
  map => map.setRain(undefined)
)
</script>

<template>
  <slot />
</template>
