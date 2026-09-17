---
name: movk-maplibre
description: |
  Build maps declaratively with @movk/maplibre (movk-maplibre), a Vue 3 / Nuxt 4 wrapper around MapLibre GL JS v6 (no access token required).
  Use this when the user wants to: build or scaffold a map with @movk/maplibre or movk-maplibre; add a MapLibre
  layer or data source (circle/line/fill/symbol/heatmap/3D buildings); add markers, popups, controls or
  drawing tools; overlay a Tianditu (天地图) basemap; convert between WGS84/GCJ02/BD09 coordinates; or use
  declarative MapLibre components inside a Nuxt or Vue + Vite project.
---

# movk-maplibre

`@movk/maplibre` is a declarative MapLibre GL JS v6 wrapper; MapLibre needs no access token. The same runtime ships two ways: as a **Nuxt 4 module** (components and composables auto-imported) and as a **Vue + Vite plugin** (unplugin). You compose a map from components instead of writing imperative `map.addSource` / `map.addLayer` calls.

When you need exact, current props or APIs, query the docs MCP at `https://maplibre.mhaibaraai.cn/mcp` (tools `list-maplibre-components`, `get-component`, `get-layer-paint-schema`) or read `https://maplibre.mhaibaraai.cn/llms.txt`. Do not invent prop names.

## Install and configure

```bash
pnpm add @movk/maplibre maplibre-gl
# drawing support:
pnpm add terra-draw terra-draw-maplibre-gl-adapter
```

Nuxt — register the module. Only Tianditu basemaps need a token, read from env vars (never hardcode); set `glyphs` / `textFont` when text labels are needed on a blank style:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  modules: ['@movk/maplibre'],
  maplibre: {
    glyphs: 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf',
    textFont: ['Noto Sans Regular']
  }
})
```

```bash [.env]
NUXT_PUBLIC_MAPLIBRE_TIANDITU_TOKEN=your_tianditu_tk
```

For Vue + Vite setup, query the docs (`/docs/getting-started/vue`).

## Core pattern

A map is `MaplibreMap` with declarative children. Omitting `options.style` gives a blank style (useful for Tianditu-only maps); keyless vector styles are available from OpenFreeMap. Components are SSR-safe — **no `<ClientOnly>` wrapper needed**. The container must have an explicit height.

```vue
<script setup lang="ts">
const center = ref<[number, number]>([116.397, 39.908])
const zoom = ref(11)
</script>

<template>
  <div class="h-115 w-full">
    <MaplibreMap
      v-model:center="center"
      v-model:zoom="zoom"
      :options="{ style: 'https://tiles.openfreemap.org/styles/positron' }"
    >
      <MaplibreLayer
        layer-id="points"
        type="circle"
        :source="{ type: 'geojson', data: '/points.geojson' }"
        :paint="{ 'circle-radius': 6, 'circle-color': '#e11d48' }"
      />
      <MaplibreNavigationControl position="top-right" />
    </MaplibreMap>
  </div>
</template>
```

Key ideas:

- **`MaplibreLayer`** takes `layer-id`, `type`, a `source` (inline spec or a referenced source id), and reactive `paint` / `layout`. Changing `paint` triggers an incremental `setPaintProperty`, not a rebuild.
- **`MaplibreSource`** declares a shared source that multiple layers reference by id.
- **Camera `v-model`** (`center` / `zoom` / `bearing` / `pitch`) is two-way but diffed against the map's current value to avoid feedback loops.
- Building a layer: create in `onReady`, update in `watch`, tear down in `onUnmounted`. `onReady` re-runs after `setStyle`, so layers rebuild when the basemap changes.

## Must-follow conventions

Read [references/conventions.md](references/conventions.md) before writing code. The critical ones: explicit container height; SSR-safe (no `<ClientOnly>`); strip `undefined` from option objects (`omitUndefined`); custom component file names must be globally unique.

## References

- [references/components.md](references/components.md) — component catalog with minimal usage for Map, Source, Layer, Marker, Popup, controls, Tianditu, Draw.
- [references/recipes.md](references/recipes.md) — task recipes: GeoJSON layers, Tianditu basemap, coordinate conversion, drawing, buffer/measure.
- [references/conventions.md](references/conventions.md) — auto-import, lifecycle, camera loop and other hard constraints.
- [references/tianditu-api.md](references/tianditu-api.md) — Tianditu (天地图) WEB service API reference (search, bus, geocoding, administrative divisions, driving directions, static map); source of truth for `utils/tianditu-*.ts` fields, since the official docs are incomplete/outdated for some endpoints.
