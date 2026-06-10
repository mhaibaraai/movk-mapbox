import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { MapboxRuntimeConfig } from '../types'
import { setMapboxConfig } from '../domains/map/config'

// Nuxt 模式：把 runtimeConfig.public.mapbox 注入运行时配置单例。
// 通用插件（非 client-only）：SSR 渲染 Source/Layer（如 MapboxTiandituLayer 的 source 计算）
// 时同样能读到 token，避免「token missing」的服务端误报。mapboxgl 全局应用仍只在客户端 createMapboxGl。
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public.mapbox as Partial<MapboxRuntimeConfig> | undefined
  if (config) setMapboxConfig(config)
})
