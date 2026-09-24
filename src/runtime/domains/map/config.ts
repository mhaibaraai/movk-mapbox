import { defineGlobalSingleton } from '@movk/core'
import type { MaplibreRuntimeConfig } from '../../types'

interface ConfigStore {
  config: MaplibreRuntimeConfig
}

// 全局单例：即使 Nuxt 与 Vue 双构建各自打包一份本模块，
// 也共享同一份状态，保证 vue-plugin 注入的配置对运行时组件可见。
const store = defineGlobalSingleton<ConfigStore>('movk-maplibre:config', () => ({ config: {} }))

export function setMaplibreConfig(value: Partial<MaplibreRuntimeConfig>): void {
  store.config = { ...store.config, ...value }
}

export function getMaplibreConfig(): MaplibreRuntimeConfig {
  return store.config
}

/** 库内置文字图层的 layout 字体片段：配置了 textFont 才输出，否则交由样式默认 */
export function textFontLayout(): { 'text-font'?: string[] } {
  const { textFont } = store.config
  return textFont ? { 'text-font': textFont } : {}
}
