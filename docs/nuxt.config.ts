import pkg from '../package.json'

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],

  modules: ['@movk/mapbox'],

  $development: {
    site: {
      url: 'http://localhost:3000'
    }
  },

  $production: {
    site: {
      url: 'https://mapbox.mhaibaraai.cn'
    }
  },

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  site: {
    name: 'Movk Mapbox'
  },

  runtimeConfig: {
    public: {
      version: pkg.version
    }
  },

  routeRules: {
    '/docs': { redirect: '/docs/getting-started', prerender: false },
    '/docs/core': { redirect: '/docs/core/map', prerender: false },
    '/docs/layers': { redirect: '/docs/layers/circle', prerender: false },
    '/docs/controls': { redirect: '/docs/controls/navigation', prerender: false },
    '/docs/effects': { redirect: '/docs/effects/window-building', prerender: false },
    '/docs/environment': { redirect: '/docs/environment/fog', prerender: false },
    '/docs/extensions': { redirect: '/docs/extensions/draw', prerender: false },
    '/docs/composables': { redirect: '/docs/composables/use-map', prerender: false },
    '/docs/utils': { redirect: '/docs/utils/buffer', prerender: false }
  },

  compatibilityDate: 'latest',

  vite: {
    optimizeDeps: {
      include: [
        '@movk/nuxt-docs > shiki-stream/vue',
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
        'gcoord',
        'lottie-web',
        'mapbox-gl'
      ]
    }
  },

  aiChat: {
    model: 'alibaba/glm-5.1',
    models: [
      'alibaba/qwen3.7-plus',
      'alibaba/glm-5.1',
      'alibaba/deepseek-v3.2'
    ]
  },

  llms: {
    domain: 'https://mapbox.mhaibaraai.cn',
    title: 'Movk Mapbox',
    description: '声明式 Mapbox GL v3 封装库：提供 MapboxMap / MapboxSource / MapboxLayer 等组件与 composables，原生支持 Nuxt 4 模块，并经 Vite 插件在纯 Vue + Vite 项目中通用；内置绘制、天地图、WMS/WMTS、多坐标系本土化与丰富的图层效果。'
  },

  // token 由环境变量注入，模块写入 runtimeConfig.public.mapbox 供组件读取
  mapbox: {
    accessToken: process.env.NUXT_MAPBOX_TOKEN || '',
    tiandituToken: process.env.NUXT_TIANDITU_TOKEN || ''
  },

  mcp: {
    name: 'Movk Mapbox',
    browserRedirect: '/docs/getting-started/ai/mcp'
  }
})
