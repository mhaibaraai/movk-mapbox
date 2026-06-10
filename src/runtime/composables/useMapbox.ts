import type { MapboxContext } from '../types'
import { getMapContext } from '../domains/map/registry'

/**
 * 按 id 从注册表获取地图上下文（逃生口）。
 * 用于在组件树之外或跨路由访问已挂载的地图；未找到时返回 undefined。
 */
export function useMapbox(id: string): MapboxContext | undefined {
  return getMapContext(id)
}
