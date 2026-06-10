export default defineNuxtConfig({
  modules: ['../../src/module', '@nuxt/ui'],
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  compatibilityDate: 'latest',
  mapbox: {
    accessToken: process.env.NUXT_MAPBOX_TOKEN || '',
    tiandituToken: process.env.NUXT_TIANDITU_TOKEN || ''
  }
})
