import { createRequire } from 'node:module'
import { addComponentsDir, addImports, addImportsDir, addPlugin, addPluginTemplate, createResolver, defineNuxtModule, extendViteConfig } from '@nuxt/kit'
import { defu } from 'defu'
import { name, version } from '../package.json'

export type * from './runtime/types'

export interface ModuleOptions {
  /** 天地图服务 token（tk） */
  tk?: string
  /** 空白样式的字体 pbf 地址模板（含 {fontstack} 与 {range}） */
  glyphs?: string
  /** 库内置文字图层使用的字体栈 */
  textFont?: string[]
  /**
   * 组件前缀
   * @defaultValue 'Maplibre'
   */
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'maplibre',
    compatibility: { nuxt: '>=4.0.0' }
  },
  defaults: {
    prefix: 'Maplibre'
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.alias['#maplibre'] = resolve('./runtime')

    const publicConfig = nuxt.options.runtimeConfig.public as Record<string, unknown>
    publicConfig.maplibre = defu(publicConfig.maplibre as Record<string, unknown> | undefined, {
      tk: options.tk || process.env.NUXT_PUBLIC_MAPLIBRE_TK,
      glyphs: options.glyphs,
      textFont: options.textFont
    })

    nuxt.options.css.push(resolve('./runtime/index.css'))

    addComponentsDir({
      path: resolve('./runtime/components'),
      prefix: options.prefix,
      pathPrefix: false
    })
    addImportsDir(resolve('./runtime/composables'))
    // 标绘自定义模式与主题工厂(非 composable,显式登记自动导入)
    addImports([
      { name: 'movkDrawModes', from: resolve('./runtime/draw-modes') },
      { name: 'drawThemeStyles', from: resolve('./runtime/utils/draw-theme') }
    ])
    addPlugin({ src: resolve('./runtime/plugins/config') })
    // maplibre-gl v6 经打包工具使用时无法自动解析 worker 地址；由应用自身的 Vite 处理 ?worker&url 并注入
    addPluginTemplate({
      filename: 'movk-maplibre-worker.client.mjs',
      mode: 'client',
      getContents: () => [
        `import { defineNuxtPlugin } from '#app'`,
        `import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'`,
        `import { setMaplibreConfig } from ${JSON.stringify(resolve('./runtime/domains/map/config'))}`,
        `export default defineNuxtPlugin(() => { setMaplibreConfig({ workerUrl }) })`
      ].join('\n')
    })

    // lottie-web 是纯 CJS，需预构建才能具名导入
    extendViteConfig((config) => {
      config.optimizeDeps ||= {}
      const include = (config.optimizeDeps.include ||= [])
      const require = createRequire(import.meta.url)
      if (include.includes('lottie-web')) return
      try {
        require.resolve('lottie-web', { paths: [nuxt.options.rootDir] })
        include.push('lottie-web')
      } catch {
        // 可选依赖未安装时跳过，避免 Vite optimizeDeps 解析告警
      }
    })
  }
})
