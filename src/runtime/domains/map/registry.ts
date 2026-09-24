import { createRegistry } from '@movk/core'
import type { MaplibreContext } from '../../types'

// 纯 id → context 注册表：仅供跨树/跨路由外部访问与 persistent 复用，非主反应式机制。
const registry = createRegistry<MaplibreContext>()

export function registerMap(context: MaplibreContext): void {
  registry.register(context.id, context)
}

export function unregisterMap(id: string): void {
  registry.unregister(id)
}

export function getMapContext(id: string): MaplibreContext | undefined {
  return registry.get(id)
}
