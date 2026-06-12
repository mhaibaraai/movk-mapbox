import { inject } from 'vue'
import type { MapboxContext } from '../../types'
import { MapboxContextKey } from './context'
import { getMapContext } from './registry'

/**
 * setup 阶段捕获注入上下文，返回延迟解析器：
 * 显式 mapId 优先查注册表（地图挂载后可得），否则回退当前注入。
 * 供可在 MapboxMap 子树外使用的交互 composables 共享。
 */
export function useContextResolver(mapId?: string): () => MapboxContext | undefined {
  const injected = inject(MapboxContextKey, null)
  return () => (mapId ? getMapContext(mapId) : injected ?? undefined)
}
