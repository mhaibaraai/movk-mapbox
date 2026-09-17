[![Movk MapLibre](https://maplibre.mhaibaraai.cn/og-image.png)](https://maplibre.mhaibaraai.cn/)

English | [简体中文](./README.md)

> A declarative MapLibre GL wrapper — compose maps with `MaplibreMap` / `MaplibreSource` / `MaplibreLayer` components and composables. The same `src/runtime` ships as a Nuxt 4 module and works in plain Vue + Vite projects via a Vite plugin. Built-in 3D buildings, dynamic effects (radar / diffusion / glow), sky / terrain environments, drawing (terra-draw), Tianditu tiles, WMS / WMTS, and multi-CRS localization support.

[![Install MCP in Cursor](https://maplibre.mhaibaraai.cn/mcp/badge.svg)](https://maplibre.mhaibaraai.cn/mcp/deeplink)
[![Install MCP in VS Code](https://maplibre.mhaibaraai.cn/mcp/badge.svg?ide=vscode)](https://maplibre.mhaibaraai.cn/mcp/deeplink?ide=vscode)

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82.svg)](https://nuxt.com/)
[![MapLibre GL](https://img.shields.io/badge/MapLibre%20GL-v6-396cb2.svg)](https://maplibre.org/maplibre-gl-js/docs/)
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![License][license-src]][license-href]

- 📖 [Documentation](https://maplibre.mhaibaraai.cn)
- 🇨🇳 [中文 README](./README.md)

## ✨ Features

- **Declarative composition** — Build maps, sources, layers, markers, popups, and controls with components. No imperative instance lifecycle management required.
- **Context injection architecture** — `MaplibreContext` is propagated via provide/inject. Child components access the instance with `useMap()` directly, no id lookup needed.
- **Two-way camera binding** — `v-model:center` / `zoom` / `bearing` / `pitch`, with cross-route persistence (`persistent` + keepalive).
- **Rich layers and effects** — circle / fill / line / symbol / fill-extrusion / heatmap, clustering, buildings, raster, video, plus dynamic effects: radar / diffusion / glow / wave / migration / trail.
- **3D environment** — Sky and atmosphere, terrain, and temperature heatmaps.
- **Localization extensions** — Tianditu base tiles, WMS / WMTS services, `MaplibreDrawControl` drawing, and gcoord multi-CRS conversion (WGS84 / GCJ02 / BD09).
- **SSR safe** — Map instances are created client-side in `onMounted` inside the component. No `<ClientOnly>` wrapper needed.
- **AI friendly** — Built-in MCP Server and `llms.txt`. Components, composables, and docs are indexable by AI agents.

The same components work in both Nuxt 4 and plain Vue + Vite. Drawing capabilities require the optional `terra-draw` and `terra-draw-maplibre-gl-adapter` packages.

## 🚀 Quick Start

### Installation

```bash
# pnpm
pnpm add @movk/maplibre maplibre-gl

# yarn
yarn add @movk/maplibre maplibre-gl

# npm
npm install @movk/maplibre maplibre-gl
```

```bash
# Optional: drawing support
pnpm add terra-draw terra-draw-maplibre-gl-adapter
```

### Nuxt

Register the module in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@movk/maplibre']
})
```

MapLibre needs no access token; when using Tianditu basemaps, the Tianditu token is read from an environment variable:

```bash
NUXT_PUBLIC_MAPLIBRE_TIANDITU_TOKEN=your_tianditu_tk
```

Components and composables are auto-imported — ready to use out of the box.

### Vue + Vite

Use the Vite plugin and Vue plugin in plain Vue + Vite projects. The API is identical to Nuxt:

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
// maplibre-gl v6 needs an explicit worker URL when bundled by Vite
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import App from './App.vue'

createApp(App)
  .use(MaplibrePlugin, { workerUrl, tiandituToken: import.meta.env.VITE_TIANDITU_TOKEN })
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

## 📦 Core Features

### Declarative Components

All components are prefixed with `Maplibre` by default (configurable). Grouped by domain:

| Category | Components |
| --- | --- |
| Core | `MaplibreMap` `MaplibreSource` `MaplibreLayer` `MaplibreLayerGroup` `MaplibreCustomLayer` `MaplibreMarker` `MaplibreLottieMarker` `MaplibrePopup` `MaplibreTooltip` |
| Layers | `MaplibreBuildingLayer` `MaplibreClusterLayer` `MaplibreImageLayer` `MaplibreRasterLayer` `MaplibreVideoLayer` |
| Effects | `MaplibreRadar` `MaplibreDiffusionCircle` `MaplibreGlowCircle` `MaplibreWaveCircle` `MaplibreGradientBuilding` `MaplibreTextureBuilding` `MaplibreWindowBuilding` `MaplibreFlowBuilding` `MaplibreMigration` `MaplibreTrail` `MaplibreAnimatedImage` `MaplibreSpriteImage` |
| Environment | `MaplibreSky` `MaplibreTerrain` `MaplibreTemperature` |
| Controls | `MaplibreNavigationControl` `MaplibreGeolocateControl` `MaplibreFullscreenControl` `MaplibreScaleControl` `MaplibreAttributionControl` |
| Extensions | `MaplibreDrawControl` `MaplibreTiandituLayer` `MaplibreWmsLayer` `MaplibreWmtsLayer` |
| Buffers | `MaplibreBufferCircle` `MaplibreBufferEllipse` `MaplibreBufferLine` `MaplibreBufferPolygon` `MaplibreBufferSector` |

### Composables

- `useMap()` — Inject the current map context (`map` / `isLoaded` / `whenLoaded()` / `onReady()`).
- `useMaplibre(id)` — Retrieve context by id from the registry (cross-tree / cross-route escape hatch).
- `useMaplibreCamera()` — Read and control the camera (center / zoom / bearing / pitch).
- `useMaplibreImage()` — Load and manage map images (icons / patterns).
- `useFrameIcon()` — Animated icon management based on frame sequences.
- `useFeatureState()` — Feature state (hover / active) management.
- `useMapAnimation()` — Frame-by-frame animation driver with lifecycle control.
- `useMapExport()` — Export map canvas as an image.
- `useMeasure()` — Distance and area measurement.
- `useMaplibreDraw(options?)` — Access the draw context; pass `mapId` to drive drawing from outside the component tree.
- `defineMaplibreControl(onAdd, onRemove)` — Define a custom map control.

### Coordinate Conversion

```ts
import { transformPoint, transformGeoJSON } from '@movk/maplibre/utils/coordinate'

transformPoint([116.397, 39.908], 'WGS84', 'GCJ02')
transformGeoJSON(featureCollection, 'GCJ02', 'WGS84')
```

## 🏗️ Architecture

All runtime code lives in `src/runtime`, shared by both distribution paths:

- **Nuxt module** — `src/module.ts` registers components and composables, writes config such as the Tianditu token to `runtimeConfig.public.maplibre`, and sets up the `#maplibre` alias pointing to the runtime.
- **Vite + unplugin** — `src/vite.ts` / `src/vue-plugin.ts` / `src/unplugin.ts` expose plugin entry points for component resolution and auto-imports. Runtime config is shared as a `globalThis` singleton so both build targets read the same config.
- **Runtime** — Map instances are distributed via provide/inject context. `onReady()` is the unified entry point for child components to register sources and layers, and automatically rebuilds them after `setStyle`.
- **Foundation** — Built on [MapLibre GL JS v6](https://maplibre.org/maplibre-gl-js/docs/), [@movk/core](https://github.com/mhaibaraai), [Turf.js](https://turfjs.org/), [gcoord](https://github.com/hujiulong/gcoord), and [VueUse](https://vueuse.org/).

## ⚡ Tech Stack

- [MapLibre GL JS v6](https://maplibre.org/maplibre-gl-js/docs/) — Interactive vector map rendering engine
- [Nuxt 4](https://nuxt.com/) — The Intuitive Vue Framework
- [Vue 3.5](https://vuejs.org/) — The Progressive JavaScript Framework
- [TypeScript](https://www.typescriptlang.org/) — JavaScript with syntax for types
- [Turf.js](https://turfjs.org/) — Geospatial analysis; [gcoord](https://github.com/hujiulong/gcoord) — Multi-CRS conversion
- [Vitest](https://vitest.dev/) — Next Generation Testing Framework

## 📄 License

[MIT](./LICENSE) License © 2024-PRESENT [YiXuan](https://github.com/mhaibaraai)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/@movk/maplibre?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/@movk/maplibre

[npm-downloads-src]: https://img.shields.io/npm/dm/@movk/maplibre?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/@movk/maplibre

[license-src]: https://img.shields.io/github/license/mhaibaraai/movk-maplibre.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/mhaibaraai/movk-maplibre/blob/main/LICENSE
