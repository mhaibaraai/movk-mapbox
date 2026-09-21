import type { Ref, ShallowRef } from 'vue'
import type { Map as MaplibreMap, MapOptions } from 'maplibre-gl'

/** 运行时全局配置；Nuxt 模式由插件注入，Vue 模式由 vue-plugin 注入 */
export interface MaplibreRuntimeConfig {
  /** 天地图服务 token（tk），用于天地图底图与地理编码 */
  tk?: string
  /** 字体 pbf 地址模板（含 {fontstack} 与 {range}），用于 MaplibreMap 缺省的空白样式；未配置时空白样式不支持文字标注 */
  glyphs?: string
  /** 库内置文字图层（聚合计数、量算标签）使用的字体栈，需存在于当前样式的 glyphs 服务；未配置时使用 MapLibre 默认字体 */
  textFont?: string[]
  /** maplibre-gl worker 脚本地址；经打包工具（Vite 等）使用时必需，Nuxt 模块已自动注入 */
  workerUrl?: string
  /** Web Worker 数量 */
  workerCount?: number
  /** 是否预热 GL 资源 */
  prewarm?: boolean
  /** RTL 文本插件；true 使用默认 CDN，或自定义地址与懒加载 */
  RTLTextPlugin?: boolean | { pluginURL?: string, lazy?: boolean }
}

/** MaplibreMap 组件 options：剔除 container（由组件内部接管） */
export type MaplibreMapOptions = Omit<MapOptions, 'container'>

/** 弹窗触发时机；'none' 表示不绑定自动触发，由外部受控 */
export type PopupTrigger = 'click' | 'hover' | 'none'

/**
 * 由 MaplibreMap 向子组件下发的地图上下文。
 * 子组件经 useMap() 注入，直接访问实例与就绪状态，无需 id 查表。
 */
export interface MaplibreContext {
  /** 地图 id（未显式指定时为内部生成的唯一值） */
  id: string
  /** 地图实例引用；SSR 与挂载前为 undefined */
  map: ShallowRef<MaplibreMap | undefined>
  /** 样式是否已加载完成 */
  isLoaded: Ref<boolean>
  /** 样式首次加载完成时 resolve */
  whenLoaded: () => Promise<MaplibreMap>
  /**
   * 样式就绪即执行回调，且每次 setStyle 重新加载后重跑（用于重建 source/layer）。
   * 返回取消订阅函数。
   */
  onReady: (callback: (map: MaplibreMap) => void) => () => void
}
