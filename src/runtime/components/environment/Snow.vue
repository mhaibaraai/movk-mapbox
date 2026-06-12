<script setup lang="ts">
import type { SnowSpecification } from 'mapbox-gl'
import { useStyleEffect } from '../../domains/map/style-effect'

// mapbox setSnow 为实验性 API，未来版本可能变更
const props = defineProps<{
  /**
   * 降雪效果选项；缺省 {} 使用默认雪效
   * @see https://docs.mapbox.com/style-spec/reference/snow
   */
  options?: SnowSpecification
}>()

useStyleEffect(
  () => props.options,
  (map, value) => map.setSnow(value ?? {}),
  map => map.setSnow(undefined)
)
</script>

<template>
  <slot />
</template>
