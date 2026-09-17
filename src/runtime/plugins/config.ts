import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import type { MaplibreRuntimeConfig } from '../types'
import { setMaplibreConfig } from '../domains/map/config'

// Nuxt 模式：把 runtimeConfig.public.maplibre 注入运行时配置单例。
// 通用插件（非 client-only）：SSR 渲染 Source/Layer（如 MaplibreTiandituLayer 的 source 计算）
// 时同样能读到天地图 tk，避免服务端误报 token 缺失。
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig().public.maplibre as Partial<MaplibreRuntimeConfig> | undefined
  if (config) setMaplibreConfig(config)
})
