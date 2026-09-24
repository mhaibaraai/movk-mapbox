<script setup lang="ts">
import { onUnmounted } from 'vue'
import type { ProjectionDefinitionSpecification, ProjectionSpecification } from '@maplibre/maplibre-gl-style-spec'
import { useMap } from '../../composables/useMap'
import { useStyleEffect } from '../../domains/map/style-effect'
import { isDeepEqual } from '@movk/core'

const props = withDefaults(defineProps<{
  /**
   * 投影类型：'mercator' / 'globe' / 'vertical-perspective'，或按 zoom 插值的表达式（如 `['interpolate', ['linear'], ['zoom'], 10, 'vertical-perspective', 12, 'mercator']`）
   * @defaultValue 'globe'
   */
  type?: ProjectionDefinitionSpecification
  /**
   * 完整投影规格，优先级高于 type
   * @see https://maplibre.org/maplibre-style-spec/projection/
   */
  options?: ProjectionSpecification
}>(), {
  type: 'globe'
})

const ctx = useMap()

// 本组件接管前的投影：每次 style.load 取新样式自带值，卸载时还原（未声明即 mercator）
let baseline: ProjectionSpecification | undefined

// 须先于 useStyleEffect 注册：就绪回调按注册顺序执行，先记原值再覆盖
const stopCapture = ctx.onReady((map) => {
  baseline = map.getProjection()
})

useStyleEffect(
  () => props.options ?? { type: props.type },
  (map, value) => {
    // 表达式 type 不命中 maplibre 的同名短路，重复下发会销毁并重建投影
    if (!isDeepEqual(map.getProjection(), value)) map.setProjection(value)
  },
  map => map.setProjection(baseline ?? { type: 'mercator' })
)

onUnmounted(stopCapture)
</script>

<template>
  <slot />
</template>
