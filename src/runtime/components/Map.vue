<script setup lang="ts">
import { onMounted, onUnmounted, provide, useId, useTemplateRef, watch } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { omitUndefined } from '@movk/core'
import { LngLat } from 'maplibre-gl'
import type { LngLatLike, Map as MaplibreMap, MapEventType, MapOptions } from 'maplibre-gl'
import type { MaplibreMapOptions } from '../types'
import { createMaplibreContext, MaplibreContextKey } from '../domains/map/context'
import { createMaplibreGl } from '../domains/map/create-map'
import { getMapContext, registerMap, unregisterMap } from '../domains/map/registry'
import { bindMapEvents } from '../utils/events'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  /** 地图 id；省略时自动生成。提供后可经 useMaplibre(id) 外部访问 */
  mapId?: string
  /**
   * maplibre-gl Map 初始化选项（container 由组件接管）
   * @see https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/MapOptions/
   */
  options?: MaplibreMapOptions
  /** 卸载时不销毁实例，配合 keepalive / `<keep-alive>` 跨路由复用 */
  persistent?: boolean
}>(), {
  persistent: false
})

const emit = defineEmits<{
  load: [map: MaplibreMap]
  idle: [map: MaplibreMap]
  error: [event: MapEventType['error']]
  click: [event: MapEventType['click']]
  dblclick: [event: MapEventType['dblclick']]
  contextmenu: [event: MapEventType['contextmenu']]
  mousemove: [event: MapEventType['mousemove']]
  mousedown: [event: MapEventType['mousedown']]
  mouseup: [event: MapEventType['mouseup']]
  movestart: [event: MapEventType['movestart']]
  moveend: [event: MapEventType['moveend']]
  zoomstart: [event: MapEventType['zoomstart']]
  zoomend: [event: MapEventType['zoomend']]
  rotateend: [event: MapEventType['rotateend']]
  pitchend: [event: MapEventType['pitchend']]
  dragend: [event: MapEventType['dragend']]
  styledata: [event: MapEventType['styledata']]
  sourcedata: [event: MapEventType['sourcedata']]
}>()

const FORWARDED_EVENTS = [
  'error', 'click', 'dblclick', 'contextmenu', 'mousemove', 'mousedown', 'mouseup',
  'movestart', 'moveend', 'zoomstart', 'zoomend', 'rotateend', 'pitchend', 'dragend',
  'styledata', 'sourcedata'
] as const

// 双向绑定相机参数；以 syncing 标志阻断「模型→地图→moveend→模型」回环
const center = defineModel<LngLatLike>('center')
const zoom = defineModel<number>('zoom')
const bearing = defineModel<number>('bearing')
const pitch = defineModel<number>('pitch')

const container = useTemplateRef<HTMLDivElement>('container')

// useId() 保证同页多图 id 唯一且 SSR 稳定
const mapId = props.mapId ?? `movk-maplibre-${useId()}`

// setup 阶段同步建立上下文并 provide，确保子组件 useMap() 能注入；实例在 onMounted 挂载
const existing = props.mapId ? getMapContext(mapId) : undefined
const created = existing ? undefined : createMaplibreContext(mapId)
const context = existing ?? created!.context
provide(MaplibreContextKey, context)
if (created && props.mapId) registerMap(context)

function syncModelsFromMap(map: MaplibreMap): void {
  const c = map.getCenter()
  center.value = [c.lng, c.lat]
  zoom.value = map.getZoom()
  // moveend 在 pan/zoom/rotate/pitch 结束后均会冒泡，故四个相机模型一并回写
  bearing.value = map.getBearing()
  pitch.value = map.getPitch()
}

// 事件转发、相机回写与自适应；新建实例与跨实例复用的 persistent 实例都需绑定
let runtimeBound = false
function bindRuntime(map: MaplibreMap): void {
  if (runtimeBound) return
  runtimeBound = true

  bindMapEvents(map, FORWARDED_EVENTS, (type, event) => emit(type as never, event as never))
  map.on('load', () => emit('load', map))
  map.on('idle', () => emit('idle', map))
  map.on('moveend', () => syncModelsFromMap(map))

  useResizeObserver(container, () => map.resize())
}

onMounted(() => {
  // 复用 registry 中已存在的 persistent 实例：仅重绑运行时，不重建
  if (existing?.map.value) {
    bindRuntime(existing.map.value)
    return
  }
  if (!created || !container.value) return

  // 剔除 undefined：maplibre jumpTo 以 `key in options` 判定，`+undefined` 会得 NaN 污染相机矩阵
  // 相机 model 初始值并入初始化选项（model 优先，回退 options，皆无则由 omitUndefined 交还 maplibre 默认）
  const map = createMaplibreGl(omitUndefined({
    ...props.options,
    center: center.value ?? props.options?.center,
    zoom: zoom.value ?? props.options?.zoom,
    bearing: bearing.value ?? props.options?.bearing,
    pitch: pitch.value ?? props.options?.pitch,
    container: container.value
  }) as MapOptions)
  created.attach(map)
  bindRuntime(map)
})

// 与地图现值比对、差异才下发：moveend 回写令模型等于地图 settled 值，watcher 比对相等即跳过，
// 从而断开「模型→setX→moveend→模型」回环（不依赖易失效的同步 syncing 标志）
watch(center, (value) => {
  const map = context.map.value
  if (!map || !value) return
  const next = LngLat.convert(value)
  const cur = map.getCenter()
  if (Math.abs(cur.lng - next.lng) < 1e-9 && Math.abs(cur.lat - next.lat) < 1e-9) return
  map.setCenter(value)
})
watch(zoom, (value) => {
  const map = context.map.value
  if (!map || value === undefined || map.getZoom() === value) return
  map.setZoom(value)
})
watch(bearing, (value) => {
  const map = context.map.value
  if (!map || value === undefined || map.getBearing() === value) return
  map.setBearing(value)
})
watch(pitch, (value) => {
  const map = context.map.value
  if (!map || value === undefined || map.getPitch() === value) return
  map.setPitch(value)
})

// 切换底图为整样式替换；maplibre diff 跨样式会产出未实现操作（如 setSprite）并告警，
// 关闭 diff 直接整体重建，运行时 source/layer 由 style.load → onReady 重建
watch(() => props.options?.style, (style) => {
  const map = context.map.value
  if (!map || !style) return
  map.setStyle(style, { diff: false } as Parameters<typeof map.setStyle>[1])
})

onUnmounted(() => {
  if (props.persistent) return
  context.map.value?.remove()
  unregisterMap(context.id)
})

defineExpose({
  /** 当前地图上下文 */
  context: () => context
})
</script>

<template>
  <div class="movk-maplibre" v-bind="$attrs">
    <div ref="container" class="movk-maplibre__container" />
    <slot />
  </div>
</template>

<style>
@layer components {
  :where(.movk-maplibre) {
    position: relative;
    width: 100%;
    height: 100%;
  }
}

.movk-maplibre > .movk-maplibre__container {
  position: absolute;
  inset: 0;
}
</style>
