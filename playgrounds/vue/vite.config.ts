import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import ui from '@nuxt/ui/vite'
import { mapboxAutoImports, mapboxComponentResolver } from '@movk/mapbox/unplugin'

// @nuxt/ui 的 Vite 插件内置唯一的 unplugin-auto-import / unplugin-vue-components 实例，
// 并在检测到第二个实例时直接抛错。故复用本库导出的 resolver / imports 工厂，
// 注入 ui() 的 components / autoImport 选项（清单由库侧自动派生，单一数据源），
// 同时复用 playgrounds/play 的演示组件与 composables。
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
        resolvers: [mapboxComponentResolver()]
      },
      autoImport: {
        // 复用 playgrounds/play 的 composables（useNavigation）
        dirs: ['../play/app/composables'],
        imports: [
          'vue',
          'vue-router',
          ...mapboxAutoImports()
        ]
      }
    })
  ],
  optimizeDeps: {
    include: [
      '@mapbox/mapbox-gl-draw',
      '@movk/core',
      '@turf/area',
      '@turf/bearing',
      '@turf/buffer',
      '@turf/circle',
      '@turf/distance',
      '@turf/ellipse',
      '@turf/length',
      '@turf/sector',
      '@vueuse/core',
      'gcoord'
    ]
  }
})
