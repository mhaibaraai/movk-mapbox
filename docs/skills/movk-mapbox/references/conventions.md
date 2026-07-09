# Conventions and constraints

Hard rules for writing correct declarative @movk/mapbox code. The same set is exposed at runtime via the MCP resource `resource://docs/mapbox-conventions`.

## Rendering and SSR

- **No `<ClientOnly>` needed.** The map instance is created only on the client in `onMounted`; components are SSR-safe.
- **Container needs explicit height.** `MapboxMap` fills `width:100%;height:100%`; the parent must set a height (e.g. `class="h-115"`) or the map collapses to 0 and is invisible.

## Options hygiene

- **Strip `undefined`.** Run option objects through `omitUndefined` (from `@movk/core`) before handing them to a mapbox API. mapbox tests fields with `key in options`, so a leftover `undefined` pollutes the camera matrix (`+undefined → NaN`).

## Reactivity

- **Camera `v-model`.** `center` / `zoom` / `bearing` / `pitch` are two-way, but the component diffs against the map's current value and only pushes when it differs — this breaks the feedback loop with the map's own move events. Don't write your own unconditional sync.
- **Incremental updates.** Changing a layer's `paint` / `layout` calls `setPaintProperty` / `setLayoutProperty`, not a rebuild.

## Layer lifecycle (for custom components)

Follow the `Layer.vue` pattern:

- Create source/layer inside `onReady`.
- Apply incremental changes inside `watch`.
- Tear down inside `onUnmounted`.
- When referencing a source that may not be ready, listen for `sourcedata` and wait.

`onReady` re-runs on initial load **and after every `setStyle`**, so layers rebuild automatically when the basemap changes. This is why source/layer creation must live in `onReady` rather than a one-shot `onMounted`.

## Auto-import naming

- Components resolve by **bare file name** (directory ignored). Custom component file names must be **globally unique** even across subdirectories. The configured prefix (default `Mapbox`) is prepended for templates.
- Each composable file name is its exported function name.
- Non-composable exports (`movkDrawModes`, `drawThemeStyles`) are not auto-scanned; they are registered explicitly by the module/unplugin and available globally in templates.

## Tokens

- Inject Mapbox / Tianditu tokens via `runtimeConfig.public.mapbox` (Nuxt) or the Vue plugin config — never hardcode. Prefer environment variables (`NUXT_PUBLIC_MAPBOX_ACCESS_TOKEN`, `NUXT_PUBLIC_MAPBOX_TIANDITU_TOKEN`).
- With prerendering or `nuxt generate`, tokens are baked into the static output at build time; runtime env vars cannot override already-prerendered pages.
- The config is held in a singleton, shared across the Nuxt and Vue + Vite builds.

## Coordinate systems

- Tianditu basemap is WGS84; Amap/Tencent are GCJ02; Baidu is BD09. Convert data with `transformPoint` / `transformGeoJSON` from `@movk/mapbox/utils/coordinate` before overlaying, or it will be offset.
