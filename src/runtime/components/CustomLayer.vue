<script setup lang="ts">
import { onUnmounted, toRaw, watch } from 'vue'
import type { CustomLayerInterface, Map as MaplibreMap } from 'maplibre-gl'
import { useMap } from '../composables/useMap'

/** CustomLayerInterface 逃生舱：托管自定义 WebGL 图层的挂载/卸载与样式重载重建。 */
const props = defineProps<{
  /**
   * 自定义图层实现（含 id/type/render）；按引用比较，替换对象时移除旧图层并添加新图层
   * @see https://maplibre.org/maplibre-gl-js/docs/API/interfaces/CustomLayerInterface/
   */
  layer: CustomLayerInterface
  /** 插入到该图层之前 */
  beforeId?: string
}>()

const ctx = useMap()

// 锚点图层不存在时返回 undefined，即置于图层栈顶部
function resolveBeforeId(map: MaplibreMap): string | undefined {
  return props.beforeId && map.getLayer(props.beforeId) ? props.beforeId : undefined
}

// 传原始对象：render 每帧调用，经 reactive 代理访问 WebGL 状态既慢又会被依赖追踪
function addLayer(map: MaplibreMap): void {
  if (map.getLayer(props.layer.id)) return
  map.addLayer(toRaw(props.layer), resolveBeforeId(map))
}

const stopReady = ctx.onReady(addLayer)

// 自定义图层带状态与 render 函数，按引用比较；同 id 换对象也需先移除，否则 addLayer 会被跳过
watch(() => props.layer, (_next, prev) => {
  const map = ctx.map.value
  if (!map?.getLayer(prev.id)) return
  map.removeLayer(prev.id)
  addLayer(map)
})

watch(() => props.beforeId, () => {
  const map = ctx.map.value
  if (!map?.getLayer(props.layer.id)) return
  map.moveLayer(props.layer.id, resolveBeforeId(map))
})

onUnmounted(() => {
  stopReady()
  const map = ctx.map.value
  if (map?.getLayer(props.layer.id)) map.removeLayer(props.layer.id)
})
</script>

<template>
  <slot />
</template>
