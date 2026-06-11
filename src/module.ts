import { addComponentsDir, addImports, addImportsDir, addPlugin, createResolver, defineNuxtModule, useLogger } from '@nuxt/kit'
import { defu } from 'defu'
import { name, version } from '../package.json'

export type { MapboxContext, MapboxMapOptions, MapboxRuntimeConfig } from './runtime/types'

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

    const publicConfig = nuxt.options.runtimeConfig.public as Record<string, unknown>
    publicConfig.mapbox = defu(publicConfig.mapbox as Record<string, unknown> | undefined, {
      accessToken: options.accessToken ?? '',
      tiandituToken: options.tiandituToken
    })

    if (!options.accessToken) {
      logger.warn('No Mapbox accessToken configured; set `mapbox.accessToken` in nuxt.config.')
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
  }
})
