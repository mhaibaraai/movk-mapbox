import { onUnmounted, watch } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import { useMap } from '../../composables/useMap'

/**
 * 样式级效果（fog/rain/snow/lights 等）共享逻辑：
 * 就绪即应用（setStyle 重载后经 onReady 自动重设），来源变化重应用，卸载时清除。
 */
export function useStyleEffect<T>(
  source: () => T,
  apply: (map: MapboxMap, value: T) => void,
  clear: (map: MapboxMap) => void
): void {
  const ctx = useMap()

  const stopReady = ctx.onReady(map => apply(map, source()))

  watch(source, (value) => {
    const map = ctx.map.value
    if (map) apply(map, value)
  }, { deep: true })

  onUnmounted(() => {
    stopReady()
    const map = ctx.map.value
    if (map) clear(map)
  })
}
