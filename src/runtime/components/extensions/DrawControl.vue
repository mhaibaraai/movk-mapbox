<script setup lang="ts">
import { onMounted, onUnmounted, provide, watch } from 'vue'
import { TerraDraw } from 'terra-draw'
import type { TerraDrawEventListeners, TerraDrawExtend } from 'terra-draw'
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter'
import type { ControlPosition, Map as MaplibreMap } from 'maplibre-gl'
import type { Feature } from 'geojson'
import { isDeepEqual } from '@movk/core'
import { useMap } from '../../composables/useMap'
import { DrawKey } from '../../domains/map/draw'
import { addStoreFeatures, committedFeatures, createDrawContext, toStoreFeatures } from '../../domains/map/draw-context'
import { registerDraw } from '../../domains/map/draw-registry'
import { createDrawToolbar } from '../../domains/map/draw-toolbar'
import type { DrawToolbar } from '../../domains/map/draw-toolbar'
import { DRAW_MODE_NAMES, isDrawModeName, resolveDrawModes } from '../../domains/map/draw-modes'
import { drawThemeStyles } from '../../domains/map/draw-theme'
import { getMapContext } from '../../domains/map/registry'
import type { DrawModeEntry, DrawThemeOptions } from '../../types'

type FeatureId = TerraDrawExtend.FeatureId
type OnFinishContext = Parameters<TerraDrawEventListeners['finish']>[1]

const props = withDefaults(defineProps<{
  /** 工具栏停靠位置；省略用地图默认位置，变更需配合 `:key` 重建 */
  position?: ControlPosition
  /**
   * 启用的模式及工具栏按钮顺序：内置模式名套用 theme，terra-draw 实例原样使用；变更需配合 `:key` 重建
   * @defaultValue `['select', 'point', 'linestring', 'polygon', 'rectangle', 'circle', 'ellipse', 'sector']`
   * @see https://github.com/JamesLMilner/terra-draw/blob/main/guides/4.MODES.md
   */
  modes?: DrawModeEntry[]
  /** 内置模式的主题，变更即时生效；要素 properties.color 优先于主题色 */
  theme?: DrawThemeOptions
  /**
   * 是否显示内置工具栏（模式按钮 + 删除按钮）；变更需配合 `:key` 重建
   * @defaultValue true
   */
  toolbar?: boolean
  /** 绘制图层插入到该图层之下；变更需配合 `:key` 重建 */
  renderBelowLayerId?: string
}>(), {
  toolbar: true
})

const emit = defineEmits<{
  finish: [id: FeatureId, context: OnFinishContext]
  delete: [ids: FeatureId[]]
  select: [id: FeatureId]
  deselect: [id: FeatureId]
  modechange: [mode: string]
}>()

// 受控要素集合：绘制变更回写模型，外部赋值清空后重新下发（导入/导出即序列化该模型）
const features = defineModel<Feature[]>('features')
// 当前绘制模式：外部赋值或工具栏点击经 setMode 切换
const mode = defineModel<string>('mode')

const ctx = useMap()

// 断环：内部回写前记录序列化签名，外部 watch 比对相同即跳过（同 Map.vue 相机比对哲学）
let lastSyncedJson = ''
// 下发外部要素期间 clear() 会触发 delete 变更，此时不回写中间态
let applying = false

function applyFeatures(list: Feature[]): void {
  lastSyncedJson = JSON.stringify(list)
  features.value = list
}

function applyMode(value: string): void {
  mode.value = value
  toolbarControl?.setActive(value)
  emit('modechange', value)
}

const { context: drawContext, attach } = createDrawContext(ctx.id, {
  onFeatures: applyFeatures,
  onMode: applyMode
})
const draw = drawContext.draw

provide(DrawKey, drawContext)
// 仅当地图显式设了 map-id（即已进 map 注册表）才登记：自动生成的 id 外部无从知晓，注册无意义
const disposeDraw = getMapContext(ctx.id) === ctx ? registerDraw(drawContext) : undefined

let instance: TerraDraw | undefined
let boundMap: MaplibreMap | undefined
let toolbarControl: DrawToolbar | undefined
let selectedId: FeatureId | undefined

function syncFeatures(): void {
  if (instance && !applying) applyFeatures(committedFeatures(instance))
}

function setFeatures(list: Feature[]): void {
  if (!instance) return
  applying = true
  instance.clear()
  addStoreFeatures(instance, toStoreFeatures(instance, { type: 'FeatureCollection', features: list }))
  applying = false
  syncFeatures()
}

function hasMode(name: string): boolean {
  return modeNames.includes(name)
}

function setMode(value: string): void {
  if (!instance || instance.getMode() === value) return
  instance.setMode(value)
  applyMode(value)
}

const onChange = (ids: FeatureId[], type: string) => {
  if (type === 'styling') return
  if (type === 'delete' && !applying) emit('delete', ids)
  syncFeatures()
}
const onFinish = (id: FeatureId, context: OnFinishContext) => {
  emit('finish', id, context)
  syncFeatures()
}
const onSelect = (id: FeatureId) => {
  selectedId = id
  emit('select', id)
}
const onDeselect = (id: FeatureId) => {
  if (selectedId === id) selectedId = undefined
  emit('deselect', id)
}

// setStyle 会清空 terra-draw 的 source/layer；stop 保留 store 但不重绘，故重启后清空并按快照重新添加
function onStyleLoad(): void {
  if (!instance) return
  const snapshot = committedFeatures(instance)
  const current = instance.getMode()
  try {
    instance.stop()
  } catch {
    // 适配器注销时旧源已随样式移除，removeSource 必抛；此时实例已禁用、监听已解绑，可直接重启
  }
  instance.start()
  applying = true
  instance.clear()
  addStoreFeatures(instance, snapshot)
  applying = false
  instance.setMode(current)
}

const entries = props.modes ?? DRAW_MODE_NAMES
const modes = resolveDrawModes(entries, props.theme)
const modeNames = modes.map(m => m.mode)
// 仅按名解析的内置模式随 theme 更新，自定义实例的样式由使用方负责
const themedNames = entries.filter(isDrawModeName)

onMounted(async () => {
  const map = await ctx.whenLoaded()
  boundMap = map
  instance = new TerraDraw({
    adapter: new TerraDrawMapLibreGLAdapter({ map, renderBelowLayerId: props.renderBelowLayerId }),
    modes
  })
  instance.start()

  instance.on('change', onChange)
  instance.on('finish', onFinish)
  instance.on('select', onSelect)
  instance.on('deselect', onDeselect)
  map.on('style.load', onStyleLoad)

  if (props.toolbar) {
    toolbarControl = createDrawToolbar({
      modes: modeNames,
      // 再次点击当前绘制模式回到选择模式，与常见绘图工具一致
      onMode: name => setMode(name === instance?.getMode() && hasMode('select') ? 'select' : name),
      onTrash: () => {
        if (selectedId !== undefined && instance?.hasFeature(selectedId)) instance.removeFeatures([selectedId])
      }
    })
    map.addControl(toolbarControl, props.position)
  }

  attach(instance)

  if (features.value?.length) setFeatures(features.value)
  const initial = mode.value ?? (hasMode('select') ? 'select' : modeNames[0] ?? instance.getMode())
  instance.setMode(initial)
  applyMode(initial)
})

watch(features, (value) => {
  if (!instance || !value) return
  if (JSON.stringify(value) === lastSyncedJson) return
  setFeatures(value)
}, { deep: true })

watch(mode, (value) => {
  if (value) setMode(value)
})

// 父组件内联对象每次渲染都是新引用，值未变时跳过，避免反复重绘
watch(() => props.theme, (theme, previous) => {
  if (!instance || isDeepEqual(theme, previous)) return
  const styles = drawThemeStyles(theme)
  for (const name of themedNames) instance.updateModeOptions(name, { styles: styles[name] })
}, { deep: true })

onUnmounted(() => {
  disposeDraw?.()
  boundMap?.off('style.load', onStyleLoad)
  if (toolbarControl) boundMap?.removeControl(toolbarControl)
  if (!instance) return
  instance.off('change', onChange)
  instance.off('finish', onFinish)
  instance.off('select', onSelect)
  instance.off('deselect', onDeselect)
  instance.stop()
})

const { whenReady, getAll, getMode, add, deleteAll, changeMode, setFeatureProperty } = drawContext

defineExpose({
  /** terra-draw 实例引用；挂载前为 undefined */
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
