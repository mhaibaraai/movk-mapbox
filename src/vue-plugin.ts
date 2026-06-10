import type { Plugin } from 'vue'
import type { MapboxRuntimeConfig } from './runtime/types'
import { setMapboxConfig } from './runtime/domains/map/config'

export type MapboxVuePluginOptions = Partial<MapboxRuntimeConfig>

// Vue 模式：注入运行时配置（access token、天地图 tk 等）。
// 配置经 globalThis 单例共享，对自动导入的运行时组件可见。
export const MapboxPlugin: Plugin<MapboxVuePluginOptions> = {
  install(_app, options = {}) {
    setMapboxConfig(options)
  }
}

export default MapboxPlugin
