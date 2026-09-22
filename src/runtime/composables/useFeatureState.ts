import { onMounted, onUnmounted, shallowRef } from 'vue'
import type { ShallowRef } from 'vue'
import type { LngLat, MapGeoJSONFeature, Map as MaplibreMap, MapMouseEvent } from 'maplibre-gl'
import { useContextResolver } from '../domains/map/resolve'
import { onLayerDataChange } from '../utils/events'
import { logger } from '../utils/logger'

export interface UseFeatureStateOptions {
  /** 目标地图 id；在 MaplibreMap 子树外使用时必填 */
  mapId?: string
  /**
   * 维护 hover 状态
   * @defaultValue true
   */
  hover?: boolean
  /**
   * 维护 click 选中状态
   * @defaultValue true
   */
  select?: boolean
  /**
   * 悬浮时设置 pointer 指针
   * @defaultValue true
   */
  cursor?: boolean
}

export interface UseFeatureStateReturn {
  /** 当前悬浮要素 */
  hovered: ShallowRef<MapGeoJSONFeature | undefined>
  /** 当前选中要素 */
  selected: ShallowRef<MapGeoJSONFeature | undefined>
  /** 清除选中 */
  clearSelection: () => void
}

type LayerMouseEvent = MapMouseEvent & { features?: MapGeoJSONFeature[] }

/**
 * 在目标图层上维护 feature-state 的 hover/selected 状态，
 * 消费侧 paint 用 ['feature-state', 'hover' | 'selected'] 表达式驱动样式。
 * 要素必须有 id（或 source 配置 promoteId / generateId）。
 */
export function useFeatureState(layerId: string, options: UseFeatureStateOptions = {}): UseFeatureStateReturn {
  const { hover = true, select = true, cursor = true } = options
  const resolve = useContextResolver(options.mapId)

  const hovered = shallowRef<MapGeoJSONFeature>()
  const selected = shallowRef<MapGeoJSONFeature>()
  let boundMap: MaplibreMap | undefined
  // 最近一次悬浮位置，图层数据更新后据此重新查询要素
  let anchor: LngLat | undefined
  let stopDataChange: (() => void) | undefined

  function clearState(map: MaplibreMap, feature: MapGeoJSONFeature, key: string): void {
    // 样式切换后旧 source 可能已不存在，残留清理失败可安全忽略
    try {
      map.removeFeatureState(feature, key)
    } catch {
      // source removed by style switch
    }
  }

  function setCursor(map: MaplibreMap, value: string): void {
    // 地图移除后 getCanvas() 返回 undefined，卸载期游标重置可安全跳过
    const canvas = map.getCanvas()
    if (canvas) canvas.style.cursor = value
  }

  function setHovered(map: MaplibreMap, feature: MapGeoJSONFeature | undefined): void {
    const prev = hovered.value
    if (prev && prev.id !== feature?.id) clearState(map, prev, 'hover')
    if (feature && prev?.id !== feature.id) map.setFeatureState(feature, { hover: true })
    hovered.value = feature
  }

  function onMove(event: LayerMouseEvent): void {
    const map = boundMap
    const feature = event.features?.[0]
    if (!map || !feature || feature.id === undefined) return
    if (cursor) setCursor(map, 'pointer')
    anchor = event.lngLat
    if (hovered.value?.id === feature.id) return
    setHovered(map, feature)
  }

  function onLeave(): void {
    const map = boundMap
    if (!map) return
    if (cursor) setCursor(map, '')
    anchor = undefined
    setHovered(map, undefined)
  }

  function onClick(event: LayerMouseEvent): void {
    const map = boundMap
    const feature = event.features?.[0]
    if (!map || !feature || feature.id === undefined) return
    if (selected.value) clearState(map, selected.value, 'selected')
    map.setFeatureState(feature, { selected: true })
    selected.value = feature
  }

  function clearSelection(): void {
    if (boundMap && selected.value) clearState(boundMap, selected.value, 'selected')
    selected.value = undefined
  }

  // feature-state 按 id 保留，数据更新后需校验旧要素是否仍存在，避免状态错挂到新数据的同 id 要素上
  function revalidate(map: MaplibreMap): void {
    if (hovered.value && anchor) {
      const [feature] = map.queryRenderedFeatures(map.project(anchor), { layers: [layerId] })
      setHovered(map, feature?.id === undefined ? undefined : feature)
    }
    // 选中要素的 id 仍存在时 feature-state 自动延续，只需在消失时清除
    const { source, sourceLayer, id } = selected.value ?? {}
    if (source && id !== undefined) {
      const exists = map.querySourceFeatures(source, { sourceLayer, filter: ['==', ['id'], id] }).length > 0
      if (!exists) clearSelection()
    }
  }

  onMounted(async () => {
    const ctx = resolve()
    if (!ctx) {
      logger.warn('useFeatureState: no map context found; pass options.mapId or call inside <MaplibreMap>.')
      return
    }
    const map = await ctx.whenLoaded()
    boundMap = map
    if (hover) {
      map.on('mousemove', layerId, onMove)
      map.on('mouseleave', layerId, onLeave)
    }
    if (select) map.on('click', layerId, onClick)
    stopDataChange = onLayerDataChange(map, layerId, () => revalidate(map))
  })

  onUnmounted(() => {
    const map = boundMap
    if (!map) return
    if (hover) {
      map.off('mousemove', layerId, onMove)
      map.off('mouseleave', layerId, onLeave)
      onLeave()
    }
    if (select) map.off('click', layerId, onClick)
    stopDataChange?.()
    stopDataChange = undefined
    clearSelection()
    boundMap = undefined
  })

  return { hovered, selected, clearSelection }
}
