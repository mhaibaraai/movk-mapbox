[![Movk Mapbox](https://mapbox.mhaibaraai.cn/og-image.png)](https://mapbox.mhaibaraai.cn/)

English | [简体中文](./README.md)

> A declarative Mapbox GL v3 wrapper — compose maps with `MapboxMap` / `MapboxSource` / `MapboxLayer` components and composables. The same `src/runtime` ships as a Nuxt 4 module and works in plain Vue + Vite projects via a Vite plugin. Built-in 3D buildings, dynamic effects (radar / diffusion / glow), fog / terrain / weather environments, drawing (mapbox-gl-draw), Tianditu tiles, WMS / WMTS, and multi-CRS localization support.

[![Install MCP in Cursor](https://mapbox.mhaibaraai.cn/mcp/badge.svg)](https://mapbox.mhaibaraai.cn/mcp/deeplink)
[![Install MCP in VS Code](https://mapbox.mhaibaraai.cn/mcp/badge.svg?ide=vscode)](https://mapbox.mhaibaraai.cn/mcp/deeplink?ide=vscode)

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82.svg)](https://nuxt.com/)
[![Mapbox GL](https://img.shields.io/badge/Mapbox%20GL-v3-4264fb.svg)](https://docs.mapbox.com/mapbox-gl-js/)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

- 📖 [Documentation](https://mapbox.mhaibaraai.cn)
- 🇨🇳 [中文 README](./README.md)

## ✨ Features

- **Declarative composition** — Build maps, sources, layers, markers, popups, and controls with components. No imperative instance lifecycle management required.
- **Context injection architecture** — `MapboxContext` is propagated via provide/inject. Child components access the instance with `useMap()` directly, no id lookup needed.
- **Two-way camera binding** — `v-model:center` / `zoom` / `bearing` / `pitch`, with cross-route persistence (`persistent` + keepalive).
- **Rich layers and effects** — circle / fill / line / symbol / fill-extrusion / heatmap, clustering, buildings, raster, video, plus dynamic effects: radar / diffusion / glow / wave / migration / trail.
- **Environment and weather** — Fog atmosphere, 3D lights, terrain, temperature / rain / snow.
- **Localization extensions** — Tianditu base tiles, WMS / WMTS services, `MapboxDrawControl` drawing, and gcoord multi-CRS conversion (WGS84 / GCJ02 / BD09).
- **SSR safe** — Map instances are created client-side in `onMounted` inside the component. No `<ClientOnly>` wrapper needed.
- **AI friendly** — Built-in MCP Server and `llms.txt`. Components, composables, and docs are indexable by AI agents.

The same components work in both Nuxt 4 and plain Vue + Vite. Drawing capabilities require the optional `@mapbox/mapbox-gl-draw` package.

## 🚀 Quick Start

### Installation

```bash
# pnpm
pnpm add @movk/mapbox mapbox-gl

# yarn
yarn add @movk/mapbox mapbox-gl

# npm
npm install @movk/mapbox mapbox-gl
```

```bash
# Optional: drawing support
pnpm add @mapbox/mapbox-gl-draw
```

### Nuxt

Register the module in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@movk/mapbox']
})
```

Tokens are read from environment variables:

```bash
NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.your_mapbox_access_token
NUXT_PUBLIC_MAPBOX_TIANDITU_TOKEN=your_tianditu_tk
```

Components and composables are auto-imported — ready to use out of the box.

### Vue + Vite

Use the Vite plugin and Vue plugin in plain Vue + Vite projects. The API is identical to Nuxt:

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
import '@movk/mapbox/index.css'
import App from './App.vue'

createApp(App)
  .use(MapboxPlugin, { accessToken: import.meta.env.VITE_MAPBOX_TOKEN })
  .mount('#app')
```

### Basic Example

Map instances are created client-side in `onMounted`. The component handles SSR safety internally — **no `<ClientOnly>` wrapper needed**:

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

## 📦 Core Features

### Declarative Components

All components are prefixed with `Mapbox` by default (configurable). Grouped by domain:

| Category | Components |
| --- | --- |
| Core | `MapboxMap` `MapboxSource` `MapboxLayer` `MapboxLayerGroup` `MapboxCustomLayer` `MapboxMarker` `MapboxLottieMarker` `MapboxPopup` `MapboxTooltip` |
| Layers | `MapboxBuildingLayer` `MapboxClusterLayer` `MapboxImageLayer` `MapboxRasterLayer` `MapboxVideoLayer` |
| Effects | `MapboxRadar` `MapboxDiffusionCircle` `MapboxGlowCircle` `MapboxWaveCircle` `MapboxGradientBuilding` `MapboxTextureBuilding` `MapboxWindowBuilding` `MapboxFlowBuilding` `MapboxMigration` `MapboxTrail` `MapboxAnimatedImage` `MapboxSpriteImage` |
| Environment & Weather | `MapboxFog` `MapboxLights` `MapboxTerrain` `MapboxTemperature` `MapboxRain` `MapboxSnow` |
| Controls | `MapboxNavigationControl` `MapboxGeolocateControl` `MapboxFullscreenControl` `MapboxScaleControl` `MapboxAttributionControl` |
| Extensions | `MapboxDrawControl` `MapboxTiandituLayer` `MapboxWmsLayer` `MapboxWmtsLayer` |
| Buffers | `MapboxBufferCircle` `MapboxBufferEllipse` `MapboxBufferLine` `MapboxBufferPolygon` `MapboxBufferSector` |

### Composables

- `useMap()` — Inject the current map context (`map` / `isLoaded` / `whenLoaded()` / `onReady()`).
- `useMapbox(id)` — Retrieve context by id from the registry (cross-tree / cross-route escape hatch).
- `useMapboxCamera()` — Read and control the camera (center / zoom / bearing / pitch).
- `useMapboxImage()` — Load and manage map images (icons / patterns).
- `useFrameIcon()` — Animated icon management based on frame sequences.
- `useFeatureState()` — Feature state (hover / active) management.
- `useMapAnimation()` — Frame-by-frame animation driver with lifecycle control.
- `useMapExport()` — Export map canvas as an image.
- `useMeasure()` — Distance and area measurement.
- `useMapboxDraw()` — Inject the current draw instance.
- `defineMapboxControl(onAdd, onRemove)` — Define a custom map control.

### Coordinate Conversion

```ts
import { transformPoint, transformGeoJSON } from '@movk/mapbox/utils/coordinate'

transformPoint([116.397, 39.908], 'WGS84', 'GCJ02')
transformGeoJSON(featureCollection, 'GCJ02', 'WGS84')
```

## 🏗️ Architecture

All runtime code lives in `src/runtime`, shared by both distribution paths:

- **Nuxt module** — `src/module.ts` registers components and composables, writes tokens to `runtimeConfig.public.mapbox`, and sets up the `#mapbox` alias pointing to the runtime.
- **Vite + unplugin** — `src/vite.ts` / `src/vue-plugin.ts` / `src/unplugin.ts` expose plugin entry points for component resolution and auto-imports. Runtime config is shared as a `globalThis` singleton so both build targets read the same token.
- **Runtime** — Map instances are distributed via provide/inject context. `onReady()` is the unified entry point for child components to register sources and layers, and automatically rebuilds them after `setStyle`.
- **Foundation** — Built on [Mapbox GL JS v3](https://docs.mapbox.com/mapbox-gl-js/), [@movk/core](https://github.com/mhaibaraai), [Turf.js](https://turfjs.org/), [gcoord](https://github.com/hujiulong/gcoord), and [VueUse](https://vueuse.org/).

## ⚡ Tech Stack

- [Mapbox GL JS v3](https://docs.mapbox.com/mapbox-gl-js/) — Interactive vector map rendering engine
- [Nuxt 4](https://nuxt.com/) — The Intuitive Vue Framework
- [Vue 3.5](https://vuejs.org/) — The Progressive JavaScript Framework
- [TypeScript](https://www.typescriptlang.org/) — JavaScript with syntax for types
- [Turf.js](https://turfjs.org/) — Geospatial analysis; [gcoord](https://github.com/hujiulong/gcoord) — Multi-CRS conversion
- [Vitest](https://vitest.dev/) — Next Generation Testing Framework

## 📄 License

[MIT](./LICENSE) License © 2024-PRESENT [YiXuan](https://github.com/mhaibaraai)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@movk/mapbox?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@movk/mapbox

[npm-downloads-src]: https://img.shields.io/npm/dm/@movk/mapbox?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@movk/mapbox

[license-src]: https://img.shields.io/github/license/mhaibaraai/movk-mapbox.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/mhaibaraai/movk-mapbox/blob/main/LICENSE
