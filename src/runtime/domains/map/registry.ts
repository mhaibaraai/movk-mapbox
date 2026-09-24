import { createRegistry } from '@movk/core'
import type { MaplibreContext } from '../../types'

// 纯 id → context 注册表：供跨树/跨路由外部访问与 persistent 复用；响应式以便按 id 引用的联动在地图晚注册时生效
const registry = createRegistry<MaplibreContext>({ reactive: true })

export function registerMap(context: MaplibreContext): void {
  registry.register(context.id, context)
}

export function unregisterMap(id: string): void {
  registry.unregister(id)
}

export function getMapContext(id: string): MaplibreContext | undefined {
  return registry.get(id)
}
