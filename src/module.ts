import { addComponentsDir, addImports, addImportsDir, addPlugin, createResolver, defineNuxtModule, extendViteConfig, useLogger } from '@nuxt/kit'
import { defu } from 'defu'
import { name, version } from '../package.json'

export type * from './runtime/types'

export interface ModuleOptions {
  /** Mapbox access token */
  accessToken?: string
  /** 天地图服务 token（tk） */
  tiandituToken?: string
  /**
   * 组件前缀
   * @defaultValue 'Mapbox'
   */
  prefix?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name,
    version,
    configKey: 'mapbox',
    compatibility: { nuxt: '>=4.0.0' }
  },
  defaults: {
    accessToken: '',
    prefix: 'Mapbox'
  },
  setup(options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    const logger = useLogger('@movk/mapbox')

    nuxt.options.alias['#mapbox'] = resolve('./runtime')

    const accessToken = options.accessToken || process.env.NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN || ''
    const publicConfig = nuxt.options.runtimeConfig.public as Record<string, unknown>
    publicConfig.mapbox = defu(publicConfig.mapbox as Record<string, unknown> | undefined, {
      accessToken,
      tiandituToken: options.tiandituToken || process.env.NUXT_PUBLIC_MAPBOX_TIANDITU_TOKEN
    })

    if (!accessToken) {
      logger.warn('No Mapbox accessToken configured; set NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN in .env or `mapbox.accessToken` in nuxt.config.')
    }

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
    addPlugin({ src: resolve('./runtime/plugins/access-token') })

    // mapbox-gl 是伪装成 ESM 的 UMD 包（否则具名导入 500），lottie-web 是纯 CJS
    extendViteConfig((config) => {
      config.optimizeDeps ||= {}
      config.optimizeDeps.include ||= []
      for (const dep of ['mapbox-gl', 'lottie-web']) {
        if (!config.optimizeDeps.include.includes(dep)) {
          config.optimizeDeps.include.push(dep)
        }
      }
    })
  }
})
