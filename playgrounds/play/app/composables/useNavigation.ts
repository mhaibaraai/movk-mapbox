import type { CommandPaletteGroup, CommandPaletteItem, NavigationMenuItem } from '@nuxt/ui'

const coreNav: NavigationMenuItem = {
  label: '核心',
  icon: 'i-lucide-map',
  defaultOpen: true,
  children: [
    { label: '基础地图', to: '/core/basic-map' },
    { label: '相机双向绑定', to: '/core/camera' },
    { label: '跨路由持久化', to: '/core/persistent' }
  ]
}

const sourcesNav: NavigationMenuItem = {
  label: '数据源',
  icon: 'i-lucide-database',
  defaultOpen: true,
  children: [
    { label: 'GeoJSON', to: '/sources/geojson' },
    { label: 'Vector 矢量瓦片', to: '/sources/vector' },
    { label: 'Raster 栅格瓦片', to: '/sources/raster' },
    { label: 'Image 图片', to: '/sources/image' }
  ]
}

const layersNav: NavigationMenuItem = {
  label: '图层',
  icon: 'i-lucide-layers',
  defaultOpen: true,
  children: [
    { label: 'Circle 圆点', to: '/layers/circle' },
    { label: 'Line 线', to: '/layers/line' },
    { label: 'Fill 填充', to: '/layers/fill' },
    { label: 'Symbol 符号', to: '/layers/symbol' },
    { label: 'Heatmap 热力', to: '/layers/heatmap' },
    { label: 'FillExtrusion 3D', to: '/layers/fill-extrusion' },
    { label: '内联 Source', to: '/layers/inline-source' }
  ]
}

const annotationsNav: NavigationMenuItem = {
  label: '标注',
  icon: 'i-lucide-map-pin',
  defaultOpen: true,
  children: [
    { label: 'Marker 标记', to: '/annotations/marker' },
    { label: 'Popup 弹窗', to: '/annotations/popup' }
  ]
}

const controlsNav: NavigationMenuItem = {
  label: '控件',
  icon: 'i-lucide-sliders-horizontal',
  defaultOpen: true,
  children: [
    { label: '内置控件', to: '/controls' }
  ]
}

const extensionsNav: NavigationMenuItem = {
  label: '扩展',
  icon: 'i-lucide-puzzle',
  defaultOpen: true,
  children: [
    { label: 'Draw 绘制', to: '/extensions/draw' },
    { label: '天地图底图', to: '/extensions/tianditu' },
    { label: 'WMTS 图层', to: '/extensions/wmts' },
    { label: 'WMS 图层', to: '/extensions/wms' },
    { label: '坐标系转换', to: '/extensions/coordinate' }
  ]
}

const components: NavigationMenuItem[] = [
  coreNav,
  sourcesNav,
  layersNav,
  annotationsNav,
  controlsNav,
  extensionsNav
]

export const useNavigation = () => {
  const items: NavigationMenuItem[] = [
    { label: '首页', icon: 'i-lucide-house', to: '/' }
  ]

  const groups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => [
    { id: 'links', items: items as unknown as CommandPaletteItem[] },
    { id: 'components', label: '能力点', items: components as unknown as CommandPaletteItem[] }
  ])

  return { components, groups, items }
}
