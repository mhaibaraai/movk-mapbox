import type { MaplibreRuntimeConfig } from '../../types'

// 以 globalThis + Symbol.for 持有配置：即使 Nuxt 与 Vue 双构建各自打包一份本模块，
// 也共享同一份状态，保证 vue-plugin 注入的配置对运行时组件可见。
const STORE_KEY = Symbol.for('movk-maplibre:config')

interface ConfigStore {
  config: MaplibreRuntimeConfig
}

const globalScope = globalThis as typeof globalThis & { [STORE_KEY]?: ConfigStore }
const store: ConfigStore = (globalScope[STORE_KEY] ??= { config: {} })

export function setMaplibreConfig(value: Partial<MaplibreRuntimeConfig>): void {
  store.config = { ...store.config, ...value }
}

export function getMaplibreConfig(): MaplibreRuntimeConfig {
  return store.config
}
