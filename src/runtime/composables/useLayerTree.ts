import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import { getLayerTree } from '../domains/map/layer-tree'
import { useContextResolver } from '../domains/map/resolve'
import type { LayerTreeItem } from '../types'

export interface UseLayerTreeOptions {
  /** 目标地图 id；在 MaplibreMap 子树外使用时必填 */
  mapId?: string
}

/**
 * 地图的图层树：按声明顺序列出带 title 的 MaplibreLayerGroup，
 * 读写显隐与透明度即写回各组的 v-model，适合在侧栏等处自绘图层面板。
 */
export function useLayerTree(options: UseLayerTreeOptions = {}): ComputedRef<LayerTreeItem[]> {
  const resolve = useContextResolver(options.mapId)
  return computed(() => {
    const context = resolve()
    if (!context) return []
    const tree = getLayerTree(context)
    return tree.keys().map(id => tree.get(id)!)
  })
}
