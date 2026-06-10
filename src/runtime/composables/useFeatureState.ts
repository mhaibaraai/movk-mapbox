import { onMounted, onUnmounted, shallowRef } from 'vue'
import type { ShallowRef } from 'vue'
import type { GeoJSONFeature, Map as MapboxMap, MapMouseEvent } from 'mapbox-gl'
import { useContextResolver } from '../domains/map/resolve'
import { logger } from '../utils/logger'

export interface UseFeatureStateOptions {
  /** 目标地图 id；在 MapboxMap 子树外使用时必填 */
  mapId?: string
  /** 维护 hover 状态，默认 true */
  hover?: boolean
  /** 维护 click 选中状态，默认 true */
  select?: boolean
  /** 悬浮时设置 pointer 指针，默认 true */
  cursor?: boolean
}

export interface UseFeatureStateReturn {
  /** 当前悬浮要素 */
  hovered: ShallowRef<GeoJSONFeature | undefined>
  /** 当前选中要素 */
  selected: ShallowRef<GeoJSONFeature | undefined>
  /** 清除选中 */
  clearSelection: () => void
}

type LayerMouseEvent = MapMouseEvent & { features?: GeoJSONFeature[] }

/**
 * 在目标图层上维护 feature-state 的 hover/selected 状态，
 * 消费侧 paint 用 ['feature-state', 'hover' | 'selected'] 表达式驱动样式。
 * 要素必须有 id（或 source 配置 promoteId / generateId）。
 */
export function useFeatureState(layerId: string, options: UseFeatureStateOptions = {}): UseFeatureStateReturn {
  const { hover = true, select = true, cursor = true } = options
  const resolve = useContextResolver(options.mapId)

  const hovered = shallowRef<GeoJSONFeature>()
  const selected = shallowRef<GeoJSONFeature>()
  let boundMap: MapboxMap | undefined

  function clearState(map: MapboxMap, feature: GeoJSONFeature, key: string): void {
    // 样式切换后旧 source 可能已不存在，残留清理失败可安全忽略
    try {
      map.removeFeatureState(feature, key)
    } catch {
      // source removed by style switch
    }
  }

  function onMove(event: LayerMouseEvent): void {
    const map = boundMap
    const feature = event.features?.[0]
    if (!map || !feature || feature.id === undefined) return
    if (cursor) map.getCanvas().style.cursor = 'pointer'
    if (hovered.value?.id === feature.id) return
    if (hovered.value) clearState(map, hovered.value, 'hover')
    map.setFeatureState(feature, { hover: true })
    hovered.value = feature
  }

  function onLeave(): void {
    const map = boundMap
    if (!map) return
    if (cursor) map.getCanvas().style.cursor = ''
    if (hovered.value) clearState(map, hovered.value, 'hover')
    hovered.value = undefined
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

  onMounted(async () => {
    const ctx = resolve()
    if (!ctx) {
      logger.warn('useFeatureState: no map context found; pass options.mapId or call inside <MapboxMap>.')
      return
    }
    const map = await ctx.whenLoaded()
    boundMap = map
    if (hover) {
      map.on('mousemove', layerId, onMove)
      map.on('mouseleave', layerId, onLeave)
    }
    if (select) map.on('click', layerId, onClick)
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
    clearSelection()
    boundMap = undefined
  })

  return { hovered, selected, clearSelection }
}
