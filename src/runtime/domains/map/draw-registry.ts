import { shallowReactive } from 'vue'
import type { MapboxDrawContext } from '../../types'
import { logger } from '../../utils/logger'

// 响应式：跨树门面以 computed 读取 draw 实例，需在注册/注销时触发重算。
const registry = shallowReactive(new Map<string, MapboxDrawContext>())

export function registerDraw(context: MapboxDrawContext): void {
  if (registry.has(context.mapId)) {
    logger.warn(`map "${context.mapId}" already has a <MapboxDrawControl>; the latest one takes over.`)
  }
  registry.set(context.mapId, context)
}

/** 按上下文身份注销：过渡期新控件可能先于旧控件卸载完成注册，按 id 删会误删新注册 */
export function unregisterDraw(context: MapboxDrawContext): void {
  if (registry.get(context.mapId) === context) registry.delete(context.mapId)
}

export function getDrawContext(mapId: string): MapboxDrawContext | undefined {
  return registry.get(mapId)
}
