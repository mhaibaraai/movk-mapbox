import { createRegistry } from '@movk/core'
import type { MaplibreDrawContext } from '../../types'
import { logger } from '../../utils/logger'

// 响应式：跨树门面以 computed 读取 draw 实例，需在注册/注销时触发重算。
const registry = createRegistry<MaplibreDrawContext>({
  reactive: true,
  onDuplicate: id => logger.warn(`map "${id}" already has a <MaplibreDrawControl>; the latest one takes over.`)
})

/** 返回按身份校验的注销句柄：过渡期新控件可能先于旧控件卸载完成注册，按 id 删会误删新注册 */
export function registerDraw(context: MaplibreDrawContext): () => void {
  return registry.register(context.mapId, context)
}

export function getDrawContext(mapId: string): MaplibreDrawContext | undefined {
  return registry.get(mapId)
}
