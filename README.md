# @movk/mapbox

声明式 Mapbox GL v3 封装库。提供 `MapboxMap` / `MapboxSource` / `MapboxLayer` 等组件与 composables，原生支持 Nuxt 4 模块，并通过 Vite 插件在纯 Vue + Vite 项目中可用。内置绘制（mapbox-gl-draw）与天地图、多坐标系本土化支持。

## 特性

- 声明式组件组合地图、数据源、图层、标记、弹窗、控件
- `MapboxContext` 注入架构：子组件经 `useMap()` 直接取实例，无需 id 查表
- 双向绑定相机参数：`v-model:center` / `zoom` / `bearing` / `pitch`
- 跨路由持久化（`persistent` + keepalive）
- 首版扩展：`MapboxDrawControl`（绘制）、`MapboxTiandituLayer`（天地图）、坐标转换（gcoord）
- 同一套组件在 Nuxt 4 与纯 Vue + Vite 下通用

## 安装

```bash
pnpm add @movk/mapbox mapbox-gl
# 可选：绘制能力
pnpm add @mapbox/mapbox-gl-draw
```

## Nuxt 4

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@movk/mapbox'],
  mapbox: {
    accessToken: process.env.NUXT_PUBLIC_MAPBOX_TOKEN,
    tiandituToken: process.env.NUXT_PUBLIC_TIANDITU_TOKEN
  }
})
```

组件与 composables 自动导入，开箱即用。地图实例只在客户端 `onMounted` 创建，组件已做 SSR 安全处理，**无需 `<ClientOnly>` 包裹**（如需跳过服务端占位渲染可自行选用）：

```vue
<script setup lang="ts">
const center = ref<[number, number]>([116.397, 39.908])
const zoom = ref(9)
</script>

<template>
  <MapboxMap v-model:center="center" v-model:zoom="zoom" :options="{ style: 'mapbox://styles/mapbox/streets-v12' }">
    <MapboxLayer
      layer-id="points"
      type="circle"
      :source="{ type: 'geojson', data: '/points.geojson' }"
      :paint="{ 'circle-radius': 8, 'circle-color': '#e11d48' }"
    />
    <MapboxNavigationControl position="top-right" />
  </MapboxMap>
</template>
```

## 纯 Vue + Vite

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import Mapbox from '@movk/mapbox/vite'

export default defineConfig({
  plugins: [vue(), Mapbox()]
})
```

```ts
// main.ts
import { createApp } from 'vue'
import MapboxPlugin from '@movk/mapbox/vue-plugin'
import '@movk/mapbox/runtime/index.css'
import App from './App.vue'

createApp(App).use(MapboxPlugin, { accessToken: import.meta.env.VITE_MAPBOX_TOKEN }).mount('#app')
```

组件与 composables 由 `@movk/mapbox/vite` 自动导入，用法与 Nuxt 完全一致。

## 组件

| 组件 | 说明 |
| --- | --- |
| `MapboxMap` | 根组件，创建并下发地图上下文 |
| `MapboxSource` | 数据源（geojson/vector/raster/image） |
| `MapboxLayer` | 图层，支持 `type` + `paint`/`layout`/`filter` 与内联 `source` |
| `MapboxMarker` | 标记，默认插槽渲染自定义 DOM，`v-model:lnglat` 双向绑定 |
| `MapboxPopup` | 弹窗，默认插槽渲染内容 |
| `MapboxNavigationControl` 等 | Navigation / Geolocate / Fullscreen / Scale / Attribution 控件 |
| `MapboxDrawControl` | 绘制控件（需安装 `@mapbox/mapbox-gl-draw`） |
| `MapboxTiandituLayer` | 天地图底图 |

## Composables

- `useMap()` — 注入当前地图上下文（`map` / `isLoaded` / `whenLoaded()` / `onReady()`）
- `useMapbox(id)` — 按 id 从注册表获取上下文（跨树/跨路由逃生口）
- `useMapboxDraw()` — 注入当前绘制实例
- `defineMapboxControl(onAdd, onRemove)` — 定义自定义控件

## 坐标转换

```ts
import { transformPoint, transformGeoJSON } from '@movk/mapbox/utils/coordinate'

transformPoint([116.397, 39.908], 'WGS84', 'GCJ02')
transformGeoJSON(featureCollection, 'GCJ02', 'WGS84')
```

## License

MIT
