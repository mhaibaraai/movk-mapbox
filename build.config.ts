import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    // Vue（非 Nuxt）支持入口
    './src/unplugin',
    './src/vite',
    './src/vue-plugin'
  ],
  declaration: true,
  failOnWarn: false,
  externals: ['vite', 'mapbox-gl', '@mapbox/mapbox-gl-draw', 'lottie-web', 'vue', '@vueuse/core', 'unplugin', 'consola'],
  hooks: {
    'mkdist:entry:options'(_ctx, _entry, options) {
      options.addRelativeDeclarationExtensions = false
    }
  }
})
