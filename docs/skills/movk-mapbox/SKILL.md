---
name: movk-mapbox
description: |
  Build maps declaratively with @movk/mapbox (movk-mapbox), a Vue 3 / Nuxt 4 wrapper around Mapbox GL v3.
  Use this when the user wants to: build or scaffold a map with @movk/mapbox or movk-mapbox; add a Mapbox
  layer or data source (circle/line/fill/symbol/heatmap/3D buildings); add markers, popups, controls or
  drawing tools; overlay a Tianditu (天地图) basemap; convert between WGS84/GCJ02/BD09 coordinates; or use
  declarative Mapbox components inside a Nuxt or Vue + Vite project.
---

# movk-mapbox

`@movk/mapbox` is a declarative Mapbox GL v3 wrapper. The same runtime ships two ways: as a **Nuxt 4 module** (components and composables auto-imported) and as a **Vue + Vite plugin** (unplugin). You compose a map from components instead of writing imperative `map.addSource` / `map.addLayer` calls.

When you need exact, current props or APIs, query the docs MCP at `https://mapbox.mhaibaraai.cn/mcp` (tools `list-mapbox-components`, `get-component`, `get-layer-paint-schema`) or read `https://mapbox.mhaibaraai.cn/llms.txt`. Do not invent prop names.

## Install and configure

```bash
pnpm add @movk/mapbox mapbox-gl
# drawing support:
pnpm add @mapbox/mapbox-gl-draw
```

Nuxt — register the module and provide tokens (never hardcode; use env vars):

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@movk/mapbox'],
  mapbox: {
    accessToken: process.env.NUXT_MAPBOX_TOKEN,
    tiandituToken: process.env.NUXT_TIANDITU_TOKEN
  }
})
```

For Vue + Vite setup, query the docs (`/docs/getting-started/vue`).

## Core pattern

A map is `MapboxMap` with declarative children. Components are SSR-safe — **no `<ClientOnly>` wrapper needed**. The container must have an explicit height.

```vue
<script setup lang="ts">
const center = ref<[number, number]>([116.397, 39.908])
const zoom = ref(11)
</script>

<template>
  <div class="h-115 w-full">
    <MapboxMap
      v-model:center="center"
      v-model:zoom="zoom"
      :options="{ style: 'mapbox://styles/mapbox/light-v11' }"
    >
      <MapboxLayer
        layer-id="points"
        type="circle"
        :source="{ type: 'geojson', data: '/points.geojson' }"
        :paint="{ 'circle-radius': 6, 'circle-color': '#e11d48' }"
      />
      <MapboxNavigationControl position="top-right" />
    </MapboxMap>
  </div>
</template>
```

Key ideas:

- **`MapboxLayer`** takes `layer-id`, `type`, a `source` (inline spec or a referenced source id), and reactive `paint` / `layout`. Changing `paint` triggers an incremental `setPaintProperty`, not a rebuild.
- **`MapboxSource`** declares a shared source that multiple layers reference by id.
- **Camera `v-model`** (`center` / `zoom` / `bearing` / `pitch`) is two-way but diffed against the map's current value to avoid feedback loops.
- Building a layer: create in `onReady`, update in `watch`, tear down in `onUnmounted`. `onReady` re-runs after `setStyle`, so layers rebuild when the basemap changes.

## Must-follow conventions

Read [references/conventions.md](references/conventions.md) before writing code. The critical ones: explicit container height; SSR-safe (no `<ClientOnly>`); strip `undefined` from option objects (`omitUndefined`); custom component file names must be globally unique.

## References

- [references/components.md](references/components.md) — component catalog with minimal usage for Map, Source, Layer, Marker, Popup, controls, Tianditu, Draw.
- [references/recipes.md](references/recipes.md) — task recipes: GeoJSON layers, Tianditu basemap, coordinate conversion, drawing, buffer/measure.
- [references/conventions.md](references/conventions.md) — auto-import, lifecycle, camera loop and other hard constraints.
