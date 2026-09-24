import { createRegistry } from '@movk/core'
import type { Registry } from '@movk/core'
import type { LayerTreeItem, MaplibreContext } from '../../types'

// 每张地图一份图层树：带 title 的图层组在此注册，供图层控件、图例与 useLayerTree 读取
const trees = new WeakMap<MaplibreContext, Registry<LayerTreeItem>>()

export function getLayerTree(context: MaplibreContext): Registry<LayerTreeItem> {
  let tree = trees.get(context)
  if (!tree) {
    tree = createRegistry<LayerTreeItem>({ reactive: true })
    trees.set(context, tree)
  }
  return tree
}
