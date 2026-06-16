import './assets/css/main.css'
import '@movk/mapbox/index.css'
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import ui from '@nuxt/ui/vue-plugin'
import MapboxPlugin from '@movk/mapbox/vue-plugin'
import App from './App.vue'

// 复用 Nuxt playground（playgrounds/play）的演示页：import.meta.glob 为每个匹配文件生成 import()，
// 经 vite.config 的 #mapbox 别名与组件/composable 复用即可在纯 Vite 下运行
const playPages = import.meta.glob('../../play/app/pages/**/*.vue')
// 本地 vue 专属页（同路径覆盖）
const localPages = import.meta.glob('./pages/**/*.vue')

function toRoutePath(file: string): string {
  const name = file.match(/\/pages(.*)\.vue$/)![1].toLowerCase()
  return name === '/index' ? '/' : name
}

const routeMap = new Map<string, RouteRecordRaw>()
for (const [file, component] of Object.entries(playPages)) {
  const path = toRoutePath(file)
  routeMap.set(path, { path, component })
}
for (const [file, component] of Object.entries(localPages)) {
  const path = toRoutePath(file)
  routeMap.set(path, { path, component })
}

const router = createRouter({
  routes: [...routeMap.values()],
  history: createWebHistory()
})

createApp(App)
  .use(router)
  .use(ui)
  .use(MapboxPlugin, { accessToken: import.meta.env.VITE_MAPBOX_TOKEN, tiandituToken: import.meta.env.VITE_TIANDITU_TOKEN })
  .mount('#app')
