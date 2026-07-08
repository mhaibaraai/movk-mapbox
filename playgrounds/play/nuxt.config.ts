export default defineNuxtConfig({
  modules: ['../../src/module', '@nuxt/ui'],

  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    tiandituApiToken: ''
  },

  compatibilityDate: '2026-06-30',

  vite: {
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
  },

  mapbox: {
    accessToken: '',
    tiandituToken: ''
  }
})
