import { onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'
import type { Map as MaplibreMap } from 'maplibre-gl'
import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec'
import { useMap } from '../../composables/useMap'
import type { StyleLayerPredicate } from '../../types'
import { opacityPropsFor, scaleOpacity } from '../../utils/layer-opacity'

interface AdoptedLayer {
  visibility: unknown
  opacity: Record<string, unknown>
}

/**
 * 图层组认领底图样式自带的图层：按过滤函数匹配 style.load 快照中的图层，记录原值后按组的
 * 有效显隐与透明度写入。每次样式重载重新匹配，卸载时恢复原值。
 */
export function useStyleLayerAdoption(
  predicate: () => StyleLayerPredicate | undefined,
  visible: Readonly<Ref<boolean>>,
  opacity: Readonly<Ref<number>>
): void {
  const ctx = useMap()
  let adopted = new Map<string, AdoptedLayer>()

  function apply(map: MaplibreMap): void {
    for (const [id, original] of adopted) {
      if (!map.getLayer(id)) continue
      map.setLayoutProperty(id, 'visibility', (visible.value ? original.visibility : 'none') as never)
      for (const [key, value] of Object.entries(original.opacity)) {
        map.setPaintProperty(id, key as never, scaleOpacity(value, opacity.value) as never)
      }
    }
  }

  function restore(map: MaplibreMap): void {
    for (const [id, original] of adopted) {
      if (!map.getLayer(id)) continue
      map.setLayoutProperty(id, 'visibility', original.visibility as never)
      for (const [key, value] of Object.entries(original.opacity)) map.setPaintProperty(id, key as never, value as never)
    }
  }

  // 仅在快照内匹配：运行时由组件添加的图层即使符合条件也不会被认领
  function adopt(map: MaplibreMap): void {
    adopted = new Map()
    const match = predicate()
    if (!match) return
    const snapshot = new Set(ctx.styleLayerIds.value)
    const layers = (map.getStyle()?.layers ?? []) as LayerSpecification[]
    for (const layer of layers) {
      if (!snapshot.has(layer.id) || !match(layer)) continue
      const opacityValues = Object.fromEntries(
        opacityPropsFor(layer.type).map(key => [key, map.getPaintProperty(layer.id, key as never)])
      )
      adopted.set(layer.id, { visibility: map.getLayoutProperty(layer.id, 'visibility'), opacity: opacityValues })
    }
    apply(map)
  }

  const stopReady = ctx.onReady(adopt)

  // 样式加载窗口期不写入：重载完成后由 onReady 按最新状态重新认领
  watch([visible, opacity], () => {
    const map = ctx.map.value
    if (map && ctx.isStyleReady.value) apply(map)
  })

  watch(predicate, () => {
    const map = ctx.map.value
    if (!map || !ctx.isStyleReady.value) return
    restore(map)
    adopt(map)
  })

  onUnmounted(() => {
    stopReady()
    const map = ctx.map.value
    if (map && ctx.isStyleReady.value) restore(map)
  })
}
