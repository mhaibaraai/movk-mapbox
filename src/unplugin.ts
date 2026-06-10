import { createUnplugin } from 'unplugin'
import type { UnpluginOptions } from 'unplugin'
import Components from 'unplugin-vue-components'
import AutoImport from 'unplugin-auto-import'

export interface MapboxUnpluginOptions {
  /** 组件前缀，默认 'Mapbox' */
  prefix?: string
  /** 是否生成 components.d.ts / auto-imports.d.ts，默认 true */
  dts?: boolean
}

// 裸组件名 → runtime/components 下的相对路径
const COMPONENT_MANIFEST: Record<string, string> = {
  Map: 'Map.vue',
  Source: 'Source.vue',
  Layer: 'Layer.vue',
  Marker: 'Marker.vue',
  Popup: 'Popup.vue',
  NavigationControl: 'controls/NavigationControl.vue',
  GeolocateControl: 'controls/GeolocateControl.vue',
  FullscreenControl: 'controls/FullscreenControl.vue',
  ScaleControl: 'controls/ScaleControl.vue',
  AttributionControl: 'controls/AttributionControl.vue',
  DrawControl: 'extensions/DrawControl.vue',
  TiandituLayer: 'extensions/TiandituLayer.vue',
  WmtsLayer: 'extensions/WmtsLayer.vue',
  WmsLayer: 'extensions/WmsLayer.vue'
}

// composable 名 → runtime/composables 下的文件名
const COMPOSABLE_MANIFEST: Record<string, string> = {
  useMap: 'useMap',
  useMapbox: 'useMapbox',
  useMapboxDraw: 'useMapboxDraw',
  defineMapboxControl: 'defineMapboxControl'
}

export const MapboxUnplugin = createUnplugin<MapboxUnpluginOptions | undefined>((options = {}, meta) => {
  const prefix = options.prefix ?? 'Mapbox'
  const dts = options.dts ?? true

  const components = Components.raw({
    dts,
    resolvers: [{
      type: 'component',
      resolve: (name: string) => {
        if (!name.startsWith(prefix)) return
        const subpath = COMPONENT_MANIFEST[name.slice(prefix.length)]
        if (!subpath) return
        return { name: 'default', from: `@movk/mapbox/runtime/components/${subpath}` }
      }
    }]
    // unplugin-vue-components 与 unplugin-auto-import 内部依赖不同大版本的 unplugin，
    // meta 类型互不兼容；用各自 raw 的形参类型做局部适配（运行时结构一致）
  }, meta as Parameters<typeof Components.raw>[1])

  const autoImport = AutoImport.raw({
    dts,
    imports: Object.entries(COMPOSABLE_MANIFEST).map(([name, file]) => ({
      from: `@movk/mapbox/runtime/composables/${file}`,
      imports: [name]
    }))
  }, meta as Parameters<typeof AutoImport.raw>[1])

  return [components, autoImport].flat() as UnpluginOptions[]
})
