import { inject } from 'vue'
import type { MaplibreContext } from '../../types'
import { MaplibreContextKey } from './context'
import { getMapContext } from './registry'

/**
 * setup 阶段捕获注入上下文，返回延迟解析器：
 * 显式 mapId 优先查注册表（地图挂载后可得），否则回退当前注入。
 * 供可在 MaplibreMap 子树外使用的交互 composables 共享。
 */
export function useContextResolver(mapId?: string): () => MaplibreContext | undefined {
  const injected = inject(MaplibreContextKey, null)
  return () => (mapId ? getMapContext(mapId) : injected ?? undefined)
}
