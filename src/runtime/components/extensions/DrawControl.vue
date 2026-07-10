<script setup lang="ts">
import { onMounted, onUnmounted, provide, watch } from 'vue'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { ControlPosition } from 'mapbox-gl'
import type { Feature } from 'geojson'
import { useMap } from '../../composables/useMap'
import { DrawKey } from '../../domains/map/draw'
import { createDrawContext } from '../../domains/map/draw-context'
import { registerDraw, unregisterDraw } from '../../domains/map/draw-registry'
import { getMapContext } from '../../domains/map/registry'

const props = defineProps<{
  /** 控件停靠位置；省略用地图默认位置 */
  position?: ControlPosition
  /**
   * MapboxDraw 构造选项
   * @see https://github.com/mapbox/mapbox-gl-draw/blob/main/docs/API.md
   */
  options?: ConstructorParameters<typeof MapboxDraw>[0]
}>()

const emit = defineEmits<{
  create: [features: Feature[]]
  update: [features: Feature[]]
  delete: [features: Feature[]]
  selectionchange: [features: Feature[]]
  modechange: [mode: string]
}>()

// 受控要素集合：绘制变更回写模型，外部赋值经 draw.set 还原（导入/导出即序列化该模型）
const features = defineModel<Feature[]>('features')
// 当前绘制模式：modechange 回写，外部赋值经 changeMode 切换
const mode = defineModel<string>('mode')

const ctx = useMap()

// 断环：内部回写前记录序列化签名，外部 watch 比对相同即跳过（同 Map.vue 相机比对哲学）
let lastSyncedJson = ''

function applyFeatures(list: Feature[]): void {
  lastSyncedJson = JSON.stringify(list)
  features.value = list
}

const { context: drawContext, attach } = createDrawContext(ctx.id, {
  onFeatures: applyFeatures,
  onMode: (value) => {
    mode.value = value
  }
})
const draw = drawContext.draw

provide(DrawKey, drawContext)
// 仅当地图显式设了 map-id（即已进 map 注册表）才登记：自动生成的 id 外部无从知晓，注册无意义
const addressable = getMapContext(ctx.id) === ctx
if (addressable) registerDraw(drawContext)

function syncFeaturesFromDraw(): void {
  const all = drawContext.getAll()
  if (all) applyFeatures(all.features)
}

// 持有 [事件名, handler] 以便卸载时逐个解绑，避免监听残留
let listeners: [string, (e: never) => void][] = []

onMounted(async () => {
  const map = await ctx.whenLoaded()
  const instance = new MapboxDraw(props.options)
  map.addControl(instance as never, props.position)
  attach(instance)

  if (features.value?.length) {
    instance.set({ type: 'FeatureCollection', features: features.value })
    lastSyncedJson = JSON.stringify(instance.getAll().features)
  }
  if (mode.value && mode.value !== instance.getMode()) {
    instance.changeMode(mode.value as never)
  } else {
    mode.value = instance.getMode()
  }

  listeners = [
    ['draw.create', (e: { features: Feature[] }) => {
      emit('create', e.features)
      syncFeaturesFromDraw()
    }],
    ['draw.update', (e: { features: Feature[] }) => {
      emit('update', e.features)
      syncFeaturesFromDraw()
    }],
    ['draw.delete', (e: { features: Feature[] }) => {
      emit('delete', e.features)
      syncFeaturesFromDraw()
    }],
    ['draw.selectionchange', (e: { features: Feature[] }) => emit('selectionchange', e.features)],
    ['draw.modechange', (e: { mode: string }) => {
      emit('modechange', e.mode)
      mode.value = e.mode
    }]
  ] as [string, (e: never) => void][]

  for (const [type, handler] of listeners) map.on(type as never, handler)
})

watch(features, (value) => {
  const instance = draw.value
  if (!instance || !value) return
  const json = JSON.stringify(value)
  if (json === lastSyncedJson) return
  lastSyncedJson = json
  instance.set({ type: 'FeatureCollection', features: value })
}, { deep: true })

// 程序式 changeMode 不触发 draw.modechange，模型值即目标值，无需回写
watch(mode, (value) => {
  const instance = draw.value
  if (!instance || !value || instance.getMode() === value) return
  instance.changeMode(value as never)
})

onUnmounted(() => {
  if (addressable) unregisterDraw(drawContext)
  const map = ctx.map.value
  if (!map) return
  for (const [type, handler] of listeners) map.off(type as never, handler)
  listeners = []
  if (draw.value) map.removeControl(draw.value as never)
})

const { whenReady, getAll, getMode, add, deleteAll, changeMode, setFeatureProperty } = drawContext

defineExpose({
  /** 绘制实例引用；挂载前为 undefined */
  draw,
  whenReady,
  getAll,
  getMode,
  add,
  deleteAll,
  changeMode,
  setFeatureProperty
})
</script>

<template>
  <slot />
</template>
