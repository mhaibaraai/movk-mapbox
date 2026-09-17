import type { Plugin } from 'vue'
import type { MaplibreRuntimeConfig } from './runtime/types'
import { setMaplibreConfig } from './runtime/domains/map/config'

export type * from './runtime/types'

export type MaplibreVuePluginOptions = Partial<MaplibreRuntimeConfig>

// Vue 模式：注入运行时配置（天地图 tk、worker 等）。
// 配置经 globalThis 单例共享，对自动导入的运行时组件可见。
export const MaplibrePlugin: Plugin<MaplibreVuePluginOptions> = {
  install(_app, options = {}) {
    setMaplibreConfig(options)
  }
}

export default MaplibrePlugin
