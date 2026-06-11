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
  LayerGroup: 'LayerGroup.vue',
  Marker: 'Marker.vue',
  Popup: 'Popup.vue',
  Tooltip: 'Tooltip.vue',
  NavigationControl: 'controls/NavigationControl.vue',
  GeolocateControl: 'controls/GeolocateControl.vue',
  FullscreenControl: 'controls/FullscreenControl.vue',
  ScaleControl: 'controls/ScaleControl.vue',
  AttributionControl: 'controls/AttributionControl.vue',
  DrawControl: 'extensions/DrawControl.vue',
  TiandituLayer: 'extensions/TiandituLayer.vue',
  WmtsLayer: 'extensions/WmtsLayer.vue',
  WmsLayer: 'extensions/WmsLayer.vue',
  ImageLayer: 'layers/ImageLayer.vue',
  VideoLayer: 'layers/VideoLayer.vue',
  RasterLayer: 'layers/RasterLayer.vue',
  BuildingLayer: 'layers/BuildingLayer.vue',
  ClusterLayer: 'layers/ClusterLayer.vue',
  Terrain: 'environment/Terrain.vue',
  Fog: 'environment/Fog.vue',
  Rain: 'environment/Rain.vue',
  Snow: 'environment/Snow.vue',
  Lights: 'environment/Lights.vue',
  CustomLayer: 'CustomLayer.vue',
  DiffusionCircle: 'effects/DiffusionCircle.vue',
  WaveCircle: 'effects/WaveCircle.vue',
  GlowCircle: 'effects/GlowCircle.vue',
  Radar: 'effects/Radar.vue',
  Trail: 'effects/Trail.vue',
  Migration: 'effects/Migration.vue',
  BufferCircle: 'buffers/BufferCircle.vue',
  BufferEllipse: 'buffers/BufferEllipse.vue',
  BufferSector: 'buffers/BufferSector.vue',
  BufferLine: 'buffers/BufferLine.vue',
  BufferPolygon: 'buffers/BufferPolygon.vue',
  GradientBuilding: 'effects/GradientBuilding.vue',
  FlowBuilding: 'effects/FlowBuilding.vue',
  WindowBuilding: 'effects/WindowBuilding.vue',
  TextureBuilding: 'effects/TextureBuilding.vue'
}

// composable 名 → runtime/composables 下的文件名
const COMPOSABLE_MANIFEST: Record<string, string> = {
  useMap: 'useMap',
  useMapbox: 'useMapbox',
  useMapboxDraw: 'useMapboxDraw',
  useFeatureState: 'useFeatureState',
  useMapboxImage: 'useMapboxImage',
  useMapboxCamera: 'useMapboxCamera',
  useMapAnimation: 'useMapAnimation',
  useMeasure: 'useMeasure',
  useMapExport: 'useMapExport',
  defineMapboxControl: 'defineMapboxControl'
}

// 工具导出名 → runtime 下相对路径(标绘模式集合与主题工厂)
const UTIL_MANIFEST: Record<string, string> = {
  movkDrawModes: 'draw-modes',
  drawThemeStyles: 'utils/draw-theme'
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
    imports: [
      ...Object.entries(COMPOSABLE_MANIFEST).map(([name, file]) => ({
        from: `@movk/mapbox/runtime/composables/${file}`,
        imports: [name]
      })),
      ...Object.entries(UTIL_MANIFEST).map(([name, file]) => ({
        from: `@movk/mapbox/runtime/${file}`,
        imports: [name]
      }))
    ]
  }, meta as Parameters<typeof AutoImport.raw>[1])

  return [components, autoImport].flat() as UnpluginOptions[]
})
