[![Movk MapLibre](https://maplibre.mhaibaraai.cn/og-image.png)](https://maplibre.mhaibaraai.cn/)

简体中文 | [English](./README.en.md)

> 声明式 MapLibre GL 封装库 —— 用 `MaplibreMap` / `MaplibreSource` / `MaplibreLayer` 等组件与 composables 组合地图。同一套 `src/runtime` 既作为 Nuxt 4 模块发布，也经 Vite 插件在纯 Vue + Vite 项目中使用。无需 access token，内置 3D 建筑、雷达 / 扩散 / 辉光等动态效果，sky / terrain 环境，绘制（terra-draw）、天地图、WMS / WMTS 与多坐标系本土化支持。

[![Install MCP in Cursor](https://maplibre.mhaibaraai.cn/mcp/badge.svg)](https://maplibre.mhaibaraai.cn/mcp/deeplink)
[![Install MCP in VS Code](https://maplibre.mhaibaraai.cn/mcp/badge.svg?ide=vscode)](https://maplibre.mhaibaraai.cn/mcp/deeplink?ide=vscode)

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82.svg)](https://nuxt.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre%20GL-v6-396cb2.svg)](https://maplibre.org/maplibre-gl-js/docs/)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

- 📖 [在线文档](https://maplibre.mhaibaraai.cn)

## ✨ 特性

- **声明式组合** - 用组件搭建地图、数据源、图层、标记、弹窗、控件，无需命令式管理实例生命周期。
- **上下文注入架构** - `MaplibreContext` 经 provide/inject 下发，子组件用 `useMap()` 直接取实例，不靠 id 查表。
- **相机双向绑定** - `v-model:center` / `zoom` / `bearing` / `pitch`，支持跨路由持久化（`persistent` + keepalive）。
- **丰富图层与效果** - circle / fill / line / symbol / fill-extrusion / heatmap、聚合、建筑、栅格、视频，叠加雷达 / 扩散 / 辉光 / 波纹 / 迁徙 / 轨迹等动态效果。
- **三维环境** - sky 天空与大气、terrain 地形与 temperature 温度热力。
- **本土化扩展** - 天地图底图、WMS / WMTS 服务、`MaplibreDrawControl` 绘制与 gcoord 多坐标系（WGS84 / GCJ02 / BD09）转换。
- **SSR 安全** - 地图实例只在客户端 `onMounted` 创建，组件内已处理，无需 `<ClientOnly>` 包裹。
- **AI 友好** - 内置 MCP Server 与 llms.txt，组件、composable、文档可被 AI 智能体检索。

同一套组件在 Nuxt 4 与纯 Vue + Vite 下通用，仅绘制能力需可选安装 `terra-draw` 与 `terra-draw-maplibre-gl-adapter`。

## 🚀 快速开始

### 安装

```bash
# pnpm
pnpm add @movk/maplibre maplibre-gl

# yarn
yarn add @movk/maplibre maplibre-gl

# npm
npm install @movk/maplibre maplibre-gl
```

```bash
# 可选：绘制能力
pnpm add terra-draw terra-draw-maplibre-gl-adapter
```

### Nuxt

在 `nuxt.config.ts` 中注册模块：

```ts
export default defineNuxtConfig({
  modules: ['@movk/maplibre']
})
```

MapLibre 无需 access token；使用天地图底图时，天地图 token 从环境变量读取：

```bash
NUXT_PUBLIC_MAPLIBRE_TK=your_tianditu_tk
```

组件与 composables 自动导入，开箱即用。

### Vue + Vite

在纯 Vue + Vite 项目中经 Vite 插件 + Vue 插件使用，用法与 Nuxt 完全一致：

```ts
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import Maplibre from '@movk/maplibre/vite'

export default defineConfig({
  plugins: [vue(), Maplibre()]
})
```

```ts
// main.ts
import { createApp } from 'vue'
import MaplibrePlugin from '@movk/maplibre/vue-plugin'
import '@movk/maplibre/index.css'
// maplibre-gl v6 经 Vite 打包时需显式提供 worker 地址
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import App from './App.vue'

createApp(App)
  .use(MaplibrePlugin, { workerUrl, tk: import.meta.env.VITE_TIANDITU_TK })
  .mount('#app')
```

### 基础示例

地图实例只在客户端 `onMounted` 创建，组件已做 SSR 安全处理，**无需 `<ClientOnly>` 包裹**：

```vue
<script setup lang="ts">
const center = ref<[number, number]>([116.397, 39.908])
const zoom = ref(9)
</script>

<template>
  <MaplibreMap v-model:center="center" v-model:zoom="zoom" :options="{ style: 'https://tiles.openfreemap.org/styles/liberty' }">
    <MaplibreLayer
      layer-id="points"
      type="circle"
      :source="{ type: 'geojson', data: '/points.geojson' }"
      :paint="{ 'circle-radius': 8, 'circle-color': '#e11d48' }"
    />
    <MaplibreNavigationControl position="top-right" />
  </MaplibreMap>
</template>
```

## 📦 核心功能

### 声明式组件

组件全局加 `Maplibre` 前缀（默认前缀可配），按领域分组：

| 分类 | 组件 |
| --- | --- |
| 核心 | `MaplibreMap` `MaplibreSource` `MaplibreLayer` `MaplibreLayerGroup` `MaplibreCustomLayer` `MaplibreMarker` `MaplibreLottieMarker` `MaplibrePopup` `MaplibreTooltip` |
| 图层 | `MaplibreBuildingLayer` `MaplibreClusterLayer` `MaplibreImageLayer` `MaplibreRasterLayer` `MaplibreVideoLayer` |
| 效果 | `MaplibreRadar` `MaplibreDiffusionCircle` `MaplibreGlowCircle` `MaplibreWaveCircle` `MaplibreGradientBuilding` `MaplibreTextureBuilding` `MaplibreWindowBuilding` `MaplibreFlowBuilding` `MaplibreMigration` `MaplibreTrail` `MaplibreAnimatedImage` `MaplibreSpriteImage` |
| 环境 | `MaplibreSky` `MaplibreTerrain` `MaplibreTemperature` |
| 控件 | `MaplibreNavigationControl` `MaplibreGeolocateControl` `MaplibreFullscreenControl` `MaplibreScaleControl` `MaplibreAttributionControl` |
| 扩展 | `MaplibreDrawControl` `MaplibreTiandituLayer` `MaplibreWmsLayer` `MaplibreWmtsLayer` |
| 缓冲 | `MaplibreBufferCircle` `MaplibreBufferEllipse` `MaplibreBufferLine` `MaplibreBufferPolygon` `MaplibreBufferSector` |

### Composables

- `useMap()` — 注入当前地图上下文（`map` / `isLoaded` / `whenLoaded()` / `onReady()`）。
- `useMaplibre(id)` — 按 id 从注册表获取上下文（跨树 / 跨路由逃生口）。
- `useMaplibreCamera()` — 读取与控制相机（center / zoom / bearing / pitch）。
- `useMaplibreImage()` — 地图图像（icon / pattern）的加载与管理。
- `useFrameIcon()` — 基于帧序列的动画图标管理。
- `useFeatureState()` — 要素状态（hover / active）管理。
- `useMapAnimation()` — 逐帧动画驱动与生命周期控制。
- `useMapExport()` — 地图画布截图导出。
- `useMeasure()` — 距离 / 面积量算。
- `useMaplibreDraw(options?)` — 获取绘制上下文；传 `mapId` 可在组件树外驱动绘制。
- `defineMaplibreControl(onAdd, onRemove)` — 定义自定义控件。

### 坐标转换

```ts
import { transformPoint, transformGeoJSON } from '@movk/maplibre/utils/coordinate'

transformPoint([116.397, 39.908], 'WGS84', 'GCJ02')
transformGeoJSON(featureCollection, 'GCJ02', 'WGS84')
```

## 🏗️ 架构分层

库的全部运行时实现都在 `src/runtime`，两条分发链共用同一套代码：

- **Nuxt 模块** - `src/module.ts` 注册组件与 composables，把天地图 token 等配置写入 `runtimeConfig.public.maplibre`，并挂 `#maplibre` 别名指向 runtime。
- **Vite + unplugin** - `src/vite.ts` / `src/vue-plugin.ts` / `src/unplugin.ts` 对外暴露插件入口，解析组件与自动导入；运行时配置以 `globalThis` 单例共享，使双构建读到同一份配置。
- **运行时** - `src/runtime` 内地图实例经 provide/inject 下发上下文，`onReady()` 是子组件建 source / layer 的统一入口，并在 `setStyle` 后自动重建。
- **基座** - 构建于 [MapLibre GL JS v6](https://maplibre.org/maplibre-gl-js/docs/)、[@movk/core](https://github.com/mhaibaraai)、[Turf.js](https://turfjs.org/)、[gcoord](https://github.com/hujiulong/gcoord) 与 [VueUse](https://vueuse.org/)。

## ⚡ 技术栈

- [MapLibre GL JS v6](https://maplibre.org/maplibre-gl-js/docs/) - 交互式矢量地图渲染引擎
- [Nuxt 4](https://nuxt.com/) - The Intuitive Vue Framework
- [Vue 3.5](https://vuejs.org/) - The Progressive JavaScript Framework
- [TypeScript](https://www.typescriptlang.org/) - JavaScript with syntax for types
- [Turf.js](https://turfjs.org/) - 地理空间分析；[gcoord](https://github.com/hujiulong/gcoord) - 多坐标系转换
- [Vitest](https://vitest.dev/) - Next Generation Testing Framework

## 📄 许可证

[MIT](./LICENSE) License © 2024-PRESENT [YiXuan](https://github.com/mhaibaraai)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@movk/maplibre?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@movk/maplibre

[npm-downloads-src]: https://img.shields.io/npm/dm/@movk/maplibre?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@movk/maplibre

[license-src]: https://img.shields.io/github/license/mhaibaraai/movk-maplibre.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/mhaibaraai/movk-maplibre/blob/main/LICENSE
