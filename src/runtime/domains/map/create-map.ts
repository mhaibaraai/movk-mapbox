import mapboxgl from 'mapbox-gl'
import type { Map as MapboxMap, MapOptions } from 'mapbox-gl'
import { getMapboxConfig } from './config'

let globalConfigApplied = false

// 首次创建地图前，把模块级配置应用到 mapboxgl 全局（token、worker、RTL 等）
function applyGlobalConfig(): void {
  if (globalConfigApplied) return
  globalConfigApplied = true

  const config = getMapboxConfig()
  if (config.accessToken) mapboxgl.accessToken = config.accessToken
  if (config.baseApiUrl) mapboxgl.baseApiUrl = config.baseApiUrl
  if (config.workerCount) mapboxgl.workerCount = config.workerCount
  if (config.prewarm) mapboxgl.prewarm()
  if (config.RTLTextPlugin) {
    const defaultPlugin = 'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js'
    const plugin = typeof config.RTLTextPlugin === 'boolean'
      ? { pluginURL: defaultPlugin, lazy: false }
      : config.RTLTextPlugin
    mapboxgl.setRTLTextPlugin(plugin.pluginURL || defaultPlugin, () => {}, plugin.lazy ?? false)
  }
}

/** 应用全局配置并创建 mapbox-gl 实例。仅在客户端调用。 */
export function createMapboxGl(options: MapOptions): MapboxMap {
  applyGlobalConfig()
  return new mapboxgl.Map(options)
}
