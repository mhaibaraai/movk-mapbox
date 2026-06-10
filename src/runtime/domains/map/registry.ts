import type { MapboxContext } from '../../types'

// 纯 id → context 注册表：仅供跨树/跨路由外部访问与 persistent 复用，非主反应式机制。
const registry = new Map<string, MapboxContext>()

export function registerMap(context: MapboxContext): void {
  registry.set(context.id, context)
}

export function unregisterMap(id: string): void {
  registry.delete(id)
}

export function getMapContext(id: string): MapboxContext | undefined {
  return registry.get(id)
}
