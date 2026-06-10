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

  // 样式加载窗口期（初始加载/setStyle 后）setter 经 _checkLoaded 必抛；
  // 吞掉即可：被跳过的应用由 style.load 后的 onReady 重跑以最新值恢复，清除则交由新样式重置
  function safeRun(map: MapboxMap, action: (map: MapboxMap) => void): void {
    try {
      action(map)
    } catch {
      // style is not done loading
    }
  }

  const stopReady = ctx.onReady(map => apply(map, source()))

  watch(source, (value) => {
    const map = ctx.map.value
    if (map) safeRun(map, m => apply(m, value))
  }, { deep: true })

  onUnmounted(() => {
    stopReady()
    const map = ctx.map.value
    if (map) safeRun(map, clear)
  })
}
