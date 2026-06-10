import { consola } from 'consola'

/** 运行时日志器，跨 Nuxt 与纯 Vue 可用；统一携带 @movk/mapbox 标签 */
export const logger = consola.withTag('@movk/mapbox')
