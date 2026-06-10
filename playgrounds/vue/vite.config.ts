import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'

// @nuxt/ui 的 Vite 插件内置唯一的 unplugin-auto-import / unplugin-vue-components 实例，
// 并拒绝额外实例。故把本库 Mapbox* 组件解析与 composable 导入合并进 ui() 的选项中，
// 同时复用 playgrounds/play 的演示组件与 composables。
const prefix = 'Mapbox'

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

const COMPOSABLE_MANIFEST: Record<string, string> = {
  useMap: 'useMap',
  useMapbox: 'useMapbox',
  useMapboxDraw: 'useMapboxDraw',
  defineMapboxControl: 'defineMapboxControl'
}

export default defineConfig({
  resolve: {
    alias: {
      // 对齐 Nuxt 模块的 #mapbox 别名，使复用的 play 页面中 '#mapbox/utils/*' 可解析
      '#mapbox': fileURLToPath(new URL('../../src/runtime', import.meta.url)),
      // dev:prepare 用 --stub 产出的 dist 入口经 jiti 运行时加载 TS 源，浏览器打包会拖入 jiti；
      // 故 vue 模式直接指向源码 vue-plugin
      '@movk/mapbox/vue-plugin': fileURLToPath(new URL('../../src/vue-plugin.ts', import.meta.url))
    }
  },
  plugins: [
    vue(),
    ui({
      components: {
        // 复用 playgrounds/play 的演示组件（MapShowcase 等）
        dirs: ['../play/app/components'],
        // 解析本库 Mapbox* 组件
        resolvers: [{
          type: 'component',
          resolve: (name: string) => {
            if (!name.startsWith(prefix)) return
            const subpath = COMPONENT_MANIFEST[name.slice(prefix.length)]
            if (!subpath) return
            // 经 #mapbox 别名直指源码，避免从未依赖本库的 play 目录解析包失败
            return { name: 'default', from: `#mapbox/components/${subpath}` }
          }
        }]
      },
      autoImport: {
        // 复用 playgrounds/play 的 composables（useNavigation）
        dirs: ['../play/app/composables'],
        imports: [
          'vue',
          'vue-router',
          ...Object.entries(COMPOSABLE_MANIFEST).map(([name, file]) => ({
            from: `#mapbox/composables/${file}`,
            imports: [name]
          }))
        ]
      }
    })
  ]
})
