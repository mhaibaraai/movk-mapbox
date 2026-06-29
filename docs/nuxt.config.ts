import pkg from '../package.json'

export default defineNuxtConfig({
  extends: ['@movk/nuxt-docs'],

  modules: ['@movk/mapbox', '@nuxtjs/i18n'],

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
    '/docs/utils': { redirect: '/docs/utils/buffer', prerender: false },
    '/en/docs': { redirect: '/en/docs/getting-started', prerender: false },
    '/en/docs/core': { redirect: '/en/docs/core/map', prerender: false },
    '/en/docs/layers': { redirect: '/en/docs/layers/circle', prerender: false },
    '/en/docs/controls': { redirect: '/en/docs/controls/navigation', prerender: false },
    '/en/docs/effects': { redirect: '/en/docs/effects/window-building', prerender: false },
    '/en/docs/environment': { redirect: '/en/docs/environment/fog', prerender: false },
    '/en/docs/extensions': { redirect: '/en/docs/extensions/draw', prerender: false },
    '/en/docs/composables': { redirect: '/en/docs/composables/use-map', prerender: false },
    '/en/docs/utils': { redirect: '/en/docs/utils/buffer', prerender: false }
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

  i18n: {
    defaultLocale: 'zh-CN',
    locales: [
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ]
  },

  llms: {
    domain: 'https://mapbox.mhaibaraai.cn',
    title: 'Movk Mapbox',
    description: '声明式 Mapbox GL v3 封装库：提供 MapboxMap / MapboxSource / MapboxLayer 等组件与 composables，原生支持 Nuxt 4 模块，并经 Vite 插件在纯 Vue + Vite 项目中通用；内置 3D 建筑、雷达 / 扩散 / 辉光等动态效果，fog / terrain / 天气环境，绘制、天地图、WMS / WMTS 与多坐标系本土化。',
    full: {
      title: 'Movk Mapbox — 声明式 Mapbox GL v3 封装库',
      description: '声明式 Mapbox GL v3 封装库的完整文档：同一套 src/runtime 既作为 Nuxt 4 模块发布，也经 Vite / unplugin 插件在纯 Vue + Vite 项目通用。涵盖快速开始与双分发接入、核心组件（MapboxMap / MapboxSource / MapboxLayer 等）、图层与控件、3D 建筑及雷达 / 扩散 / 辉光等动态效果、fog / terrain / 天气环境、绘制扩展、天地图与 WMS / WMTS、多坐标系（WGS84 / GCJ02 / BD09）本土化、composables 与工具函数的全部 API 与示例。'
    },
    notes: ['mapbox', 'mapbox-gl', 'mapbox-gl-v3', 'declarative', 'nuxt', 'nuxt4', 'vue', 'vite', 'vue-plugin', 'unplugin', 'auto-import', 'map', 'source', 'layer', 'marker', 'popup', 'controls', 'navigation', '3d-buildings', 'effects', 'radar', 'glow', 'fog', 'terrain', 'weather', 'draw', 'tianditu', 'wms', 'wmts', 'coordinate', 'wgs84', 'gcj02', 'bd09', 'turf', 'composables', 'use-map', '纯 Vue + Vite 场景经 @movk/mapbox/vite 自动导入组件与 composables，并经 @movk/mapbox/vue-plugin 注入 token；token 在 Nuxt 模式由模块配置注入，地图实例仅客户端创建，无需 ClientOnly 包裹']
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
