<script setup lang="ts">
import type { SkySpecification } from '@maplibre/maplibre-gl-style-spec'
import { useStyleEffect } from '../../domains/map/style-effect'

const props = defineProps<{
  /**
   * 天空、地平线、雾与大气混合选项；缺省 {} 使用样式规范默认值
   * @see https://maplibre.org/maplibre-style-spec/sky/
   */
  options?: SkySpecification
}>()

useStyleEffect(
  () => props.options,
  (map, value) => map.setSky(value ?? {}),
  map => map.setSky({})
)
</script>

<template>
  <slot />
</template>
