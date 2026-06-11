export default defineNuxtConfig({
  modules: ['../../src/module', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  compatibilityDate: 'latest',
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
        'gcoord',
        'lottie-web', // CJS
        'mapbox-gl' // CJS
      ]
    }
  },
  mapbox: {
    accessToken: process.env.NUXT_MAPBOX_TOKEN || '',
    tiandituToken: process.env.NUXT_TIANDITU_TOKEN || ''
  }
})
