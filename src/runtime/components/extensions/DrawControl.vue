<script setup lang="ts">
import { onMounted, onUnmounted, provide, shallowRef, watch } from 'vue'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { ControlPosition } from 'mapbox-gl'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { useMap } from '../../composables/useMap'
import { DrawKey } from '../../domains/map/draw'

const props = defineProps<{
  position?: ControlPosition
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
const draw = shallowRef<MapboxDraw>()
provide(DrawKey, draw)

// 断环：内部回写前记录序列化签名，外部 watch 比对相同即跳过（同 Map.vue 相机比对哲学）
let lastSyncedJson = ''

function syncFeaturesFromDraw(): void {
  const instance = draw.value
  if (!instance) return
  const all = instance.getAll().features
  lastSyncedJson = JSON.stringify(all)
  features.value = all
}

// 持有 [事件名, handler] 以便卸载时逐个解绑，避免监听残留
let listeners: [string, (e: never) => void][] = []

onMounted(async () => {
  const map = await ctx.whenLoaded()
  const instance = new MapboxDraw(props.options)
  map.addControl(instance as never, props.position)
  draw.value = instance

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
  const map = ctx.map.value
  if (!map) return
  for (const [type, handler] of listeners) map.off(type as never, handler)
  listeners = []
  if (draw.value) map.removeControl(draw.value as never)
})

defineExpose({
  draw: () => draw.value,
  /** 当前全部要素集合 */
  getAll: () => draw.value?.getAll(),
  /** 添加要素，返回要素 id 列表 */
  add: (geojson: Feature | FeatureCollection | Geometry) => draw.value?.add(geojson),
  /** 清空全部要素并同步模型 */
  deleteAll: () => {
    draw.value?.deleteAll()
    syncFeaturesFromDraw()
  },
  /** 切换绘制模式并同步模型 */
  changeMode: (next: string) => {
    draw.value?.changeMode(next as never)
    mode.value = next
  },
  /** 设置要素的 user_* 属性(driver theme 样式)并同步模型 */
  setFeatureProperty: (featureId: string, property: string, value: unknown) => {
    draw.value?.setFeatureProperty(featureId, property, value)
    syncFeaturesFromDraw()
  }
})
</script>

<template>
  <slot />
</template>
