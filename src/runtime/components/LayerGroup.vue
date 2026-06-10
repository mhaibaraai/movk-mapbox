<script setup lang="ts">
import { provide, toRef } from 'vue'
import { LayerGroupKey } from '../domains/map/layer-group'

/** 图层组：统一子图层的插入锚点与显隐（组开关优先于子图层自身 layout.visibility）。 */
const props = withDefaults(defineProps<{
  /** 组内图层缺省插入到该图层之前 */
  beforeId?: string
  /** 组级显隐，默认 true */
  visible?: boolean
}>(), {
  visible: true
})

provide(LayerGroupKey, {
  beforeId: toRef(props, 'beforeId'),
  visible: toRef(props, 'visible')
})
</script>

<template>
  <slot />
</template>
