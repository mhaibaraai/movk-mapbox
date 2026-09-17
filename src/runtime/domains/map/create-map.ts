import { Map as MaplibreGlMap, prewarm, setRTLTextPlugin, setWorkerCount } from 'maplibre-gl'
import type { Map as MaplibreMap, MapOptions } from 'maplibre-gl'
import { logger } from '../../utils/logger'
import { getMaplibreConfig } from './config'

const DEFAULT_RTL_PLUGIN = 'https://cdn.jsdelivr.net/npm/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js'

let globalConfigApplied = false

// 首次创建地图前，把模块级配置应用到 maplibre-gl 全局（worker、预热、RTL 插件）
function applyGlobalConfig(): void {
  if (globalConfigApplied) return
  globalConfigApplied = true

  const config = getMaplibreConfig()
  if (config.workerCount) setWorkerCount(config.workerCount)
  if (config.prewarm) prewarm()
  if (config.RTLTextPlugin) {
    const plugin = typeof config.RTLTextPlugin === 'boolean' ? {} : config.RTLTextPlugin
    setRTLTextPlugin(plugin.pluginURL || DEFAULT_RTL_PLUGIN, plugin.lazy ?? false).catch(error => logger.warn('Failed to load RTL text plugin', error))
  }
}

/** 应用全局配置并创建 maplibre-gl 实例。仅在客户端调用。 */
export function createMaplibreGl(options: MapOptions): MaplibreMap {
  applyGlobalConfig()
  return new MaplibreGlMap(options)
}
