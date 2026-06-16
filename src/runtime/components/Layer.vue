<script setup lang="ts">
import { inject, onUnmounted, watch } from 'vue'
import { omitUndefined } from '@movk/core'
import type {
  FilterSpecification,
  LayerSpecification,
  Map as MapboxMap,
  MapEventOf,
  SourceSpecification
} from 'mapbox-gl'
import { useMap } from '../composables/useMap'
import { LayerGroupKey } from '../domains/map/layer-group'
import { applyLayerProps, type LayerUpdate } from '../utils/layer'
import { bindMapEvents } from '../utils/events'

type PropBag = Record<string, unknown>

const props = defineProps<{
  /** 图层 id，全局唯一 */
  layerId: string
  /**
   * 图层类型，决定渲染方式与可用的 paint / layout 属性
   * @see https://docs.mapbox.com/style-spec/reference/layers
   */
  type: LayerSpecification['type']
  /** source id 字符串引用，或内联 source 对象（自动创建匿名源并随图层卸载） */
  source?: string | SourceSpecification
  /** 矢量瓦片源内的子图层名（source-layer），消费矢量源时必填 */
  sourceLayer?: string
  /**
   * 绘制样式属性，响应式变更经 setPaintProperty 增量下发
   * @see https://docs.mapbox.com/style-spec/reference/layers
   */
  paint?: PropBag
  /**
   * 布局属性，响应式变更经 setLayoutProperty 增量下发
   * @see https://docs.mapbox.com/style-spec/reference/layers
   */
  layout?: PropBag
  /**
   * 过滤表达式，仅渲染匹配的要素
   * @see https://docs.mapbox.com/style-spec/reference/expressions
   */
  filter?: FilterSpecification
  /**
   * 最小缩放级别，低于此级别不渲染
   * @defaultValue 0
   */
  minzoom?: number
  /**
   * 最大缩放级别，高于此级别不渲染
   * @defaultValue 24
   */
  maxzoom?: number
  /** 插入到该 id 图层之前；省略则追加到图层栈顶部 */
  beforeId?: string
}>()

const emit = defineEmits<{
  click: [event: MapEventOf<'click'>]
  dblclick: [event: MapEventOf<'dblclick'>]
  mousedown: [event: MapEventOf<'mousedown'>]
  mouseup: [event: MapEventOf<'mouseup'>]
  mousemove: [event: MapEventOf<'mousemove'>]
  mouseenter: [event: MapEventOf<'mouseenter'>]
  mouseleave: [event: MapEventOf<'mouseleave'>]
  contextmenu: [event: MapEventOf<'contextmenu'>]
}>()

const LAYER_EVENTS = ['click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseenter', 'mouseleave', 'contextmenu'] as const

const ctx = useMap()
// 所属图层组（可选）：提供缺省插入锚点与组级显隐
const group = inject(LayerGroupKey, null)
const inlineSourceId = `${props.layerId}__source`
const hasInlineSource = typeof props.source === 'object'

function resolveSourceId(): string | undefined {
  if (props.source === undefined) return undefined
  return hasInlineSource ? inlineSourceId : (props.source as string)
}

function buildSpec(): LayerSpecification {
  const spec = omitUndefined({
    id: props.layerId,
    type: props.type,
    source: resolveSourceId(),
    paint: props.paint,
    layout: props.layout,
    filter: props.filter,
    minzoom: props.minzoom,
    maxzoom: props.maxzoom
  }) as Record<string, unknown>
  if (props.sourceLayer) spec['source-layer'] = props.sourceLayer
  return spec as unknown as LayerSpecification
}

function addLayer(map: MapboxMap): void {
  if (map.getLayer(props.layerId)) return
  if (hasInlineSource && !map.getSource(inlineSourceId)) {
    map.addSource(inlineSourceId, props.source as SourceSpecification)
  }
  const anchor = props.beforeId ?? group?.beforeId.value
  const before = anchor && map.getLayer(anchor) ? anchor : undefined
  map.addLayer(buildSpec(), before)
  if (group && !group.visible.value) {
    map.setLayoutProperty(props.layerId, 'visibility', 'none')
  }
}

let stopEvents: (() => void) | undefined
let onSourceData: ((event: MapEventOf<'sourcedata'>) => void) | undefined

const stopReady = ctx.onReady((map) => {
  const sourceId = resolveSourceId()
  if (sourceId && !hasInlineSource && !map.getSource(sourceId)) {
    // 引用的 source 尚未就绪，待其加载后再补建图层；先移除上一轮 style.load 残留的监听避免堆叠
    if (onSourceData) map.off('sourcedata', onSourceData)
    onSourceData = (event: MapEventOf<'sourcedata'>) => {
      if (event.sourceId === sourceId && map.getSource(sourceId)) {
        map.off('sourcedata', onSourceData!)
        onSourceData = undefined
        addLayer(map)
        bindLayerEvents(map)
      }
    }
    map.on('sourcedata', onSourceData)
    return
  }
  addLayer(map)
  bindLayerEvents(map)
})

function bindLayerEvents(map: MapboxMap): void {
  stopEvents?.()
  stopEvents = bindMapEvents(map, LAYER_EVENTS, (type, event) => emit(type as never, event as never), props.layerId)
}

let prev: LayerUpdate = { id: props.layerId, paint: props.paint, layout: props.layout, filter: props.filter, minzoom: props.minzoom, maxzoom: props.maxzoom }
watch(
  () => [props.paint, props.layout, props.filter, props.minzoom, props.maxzoom] as const,
  () => {
    const map = ctx.map.value
    if (!map?.getLayer(props.layerId)) return
    const next: LayerUpdate = { id: props.layerId, paint: props.paint, layout: props.layout, filter: props.filter, minzoom: props.minzoom, maxzoom: props.maxzoom }
    applyLayerProps(map, next, prev)
    prev = next
  },
  { deep: true }
)

if (group) {
  watch(group.visible, (visible) => {
    const map = ctx.map.value
    if (!map?.getLayer(props.layerId)) return
    map.setLayoutProperty(props.layerId, 'visibility', visible ? 'visible' : 'none')
  })
}

onUnmounted(() => {
  stopReady()
  stopEvents?.()
  const map = ctx.map.value
  if (!map) return
  if (onSourceData) map.off('sourcedata', onSourceData)
  if (map.getLayer(props.layerId)) map.removeLayer(props.layerId)
  if (hasInlineSource && map.getSource(inlineSourceId)) map.removeSource(inlineSourceId)
})
</script>

<template>
  <slot />
</template>
