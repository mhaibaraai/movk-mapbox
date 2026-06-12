<script setup lang="ts">
import type { FogSpecification } from 'mapbox-gl'
import { useStyleEffect } from '../../domains/map/style-effect'

const props = defineProps<{
  /**
   * 大气/雾效果选项；缺省 {} 使用样式默认大气
   * @see https://docs.mapbox.com/style-spec/reference/fog
   */
  options?: FogSpecification
}>()

useStyleEffect(
  () => props.options,
  (map, value) => map.setFog(value ?? {}),
  map => map.setFog(null)
)
</script>

<template>
  <slot />
</template>
