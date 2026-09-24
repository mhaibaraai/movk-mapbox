<script setup lang="ts">
import { onUnmounted, watch } from 'vue'
import type { SourceSpecification } from '@maplibre/maplibre-gl-style-spec'
import { useMap } from '../composables/useMap'
import { updateSource } from '../utils/source'

const props = defineProps<{
  /** 数据源 id，供图层经 source 字段按字符串引用；变更需配合 `:key` 重建 */
  sourceId: string
  /**
   * 数据源定义，变化时按类型增量更新（setData / setTiles 等）
   * @see https://maplibre.org/maplibre-style-spec/sources/
   */
  source: SourceSpecification
}>()

const ctx = useMap()

const stopReady = ctx.onReady((map) => {
  if (!map.getSource(props.sourceId)) {
    map.addSource(props.sourceId, props.source)
  }
})

// 按类型增量更新已有 source，避免整源重建
watch(() => props.source, (next, prev) => {
  const source = ctx.map.value?.getSource(props.sourceId)
  if (source) updateSource(source, next, prev)
}, { deep: true })

onUnmounted(() => {
  stopReady()
  const map = ctx.map.value
  if (!map?.getSource(props.sourceId)) return
  // 仍有依赖该源的图层时 removeSource 会抛错，交由图层先行卸载；此处兜底吞掉
  try {
    map.removeSource(props.sourceId)
  } catch {
    // sources is still in use, layers will be torn down by their own unmount
  }
})
</script>

<template>
  <slot />
</template>
