import { createTianditu } from '#mapbox/utils/tianditu-client'

/** 读取服务端天地图 tk 并返回客户端；未配置时抛 500。 */
export function useTianditu() {
  const tk = useRuntimeConfig().tiandituApiToken
  if (!tk) {
    throw createError({ statusCode: 500, statusMessage: 'NUXT_TIANDITU_API_TOKEN is not configured' })
  }
  return createTianditu({ tk })
}
