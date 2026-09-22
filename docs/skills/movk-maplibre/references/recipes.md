# Task recipes

Self-contained snippets for common tasks. Each `<MaplibreMap>` needs a parent with explicit height (e.g. `class="h-115"`).

## GeoJSON point / line / fill layer

Set `MaplibreLayer` `type` and drive style through `paint`:

```vue
<!-- points -->
<MaplibreLayer
  layer-id="points" type="circle"
  :source="{ type: 'geojson', data: '/points.geojson' }"
  :paint="{ 'circle-radius': 6, 'circle-color': '#e11d48', 'circle-stroke-width': 1, 'circle-stroke-color': '#fff' }"
/>

<!-- line -->
<MaplibreLayer
  layer-id="route" type="line"
  :source="{ type: 'geojson', data: '/route.geojson' }"
  :layout="{ 'line-cap': 'round', 'line-join': 'round' }"
  :paint="{ 'line-color': '#3b82f6', 'line-width': 4 }"
/>

<!-- fill -->
<MaplibreLayer
  layer-id="area" type="fill"
  :source="{ type: 'geojson', data: '/area.geojson' }"
  :paint="{ 'fill-color': '#22c55e', 'fill-opacity': 0.4, 'fill-outline-color': '#16a34a' }"
/>
```

Two layers can share one inline source by repeating the same `:source`, or use `MaplibreSource` + `source="id"`. For paint/layout keys per type, call the MCP tool `get-layer-paint-schema`.

## Tianditu (天地图) basemap

Omit `options.style` to get a blank style, then overlay Tianditu. `layer` is `vec` / `img` / `ter`; `annotation` adds labels. Needs `tk`.

```vue
<MaplibreMap :options="{ center: [116.397, 39.908], zoom: 10 }">
  <MaplibreTiandituLayer layer="vec" annotation />
</MaplibreMap>
```

## Coordinate conversion (WGS84 / GCJ02 / BD09)

Tianditu uses WGS84; Amap/Tencent use GCJ02; Baidu uses BD09. Convert before overlaying to avoid offset.

```ts
import { transformPoint, transformGeoJSON } from '@movk/maplibre/utils/coordinate'

const gcj02 = transformPoint([121.4737, 31.2304], 'WGS84', 'GCJ02')
const fixed = transformGeoJSON(featureCollection, 'GCJ02', 'WGS84')
```

The MCP tool `convert-coordinates` does the same conversion on demand.

## Drawing

`MaplibreDrawControl` is built on terra-draw (install `terra-draw` and `terra-draw-maplibre-gl-adapter`). It uses `movkDrawModes()` by default (select, point, linestring, polygon, rectangle, circle, ellipse, sector); `theme` colors them, `controls` limits the toolbar buttons.

```vue
<script setup lang="ts">
import type { Feature } from 'geojson'
const features = ref<Feature[]>([])
const mode = ref('select')
</script>

<template>
  <MaplibreDrawControl
    v-model:features="features"
    v-model:mode="mode"
    position="top-left"
    :controls="['polygon', 'rectangle', 'circle']"
    :theme="{ color: '#8b5cf6' }"
  />
</template>
```

Set `mode` (or call `changeMode` via a template ref / `useMaplibreDraw()`) with terra-draw mode names such as `'polygon'`, `'rectangle'`, `'sector'` or `'select'`. Per-feature colors come from `properties.color` (set with `setFeatureProperty(id, 'color', '#hex')`).

## Buffer and measurement

Buffer components wrap `@turf/*` (radius in meters): `MaplibreBufferCircle`, `MaplibreBufferEllipse`, `MaplibreBufferLine`, `MaplibreBufferPolygon`, `MaplibreBufferSector`.

```vue
<MaplibreBufferCircle :center="[116.397, 39.908]" :radius="2000" color="#3b82f6" />
```

Formatting helpers:

```ts
import { formatArea, formatDistance } from '@movk/maplibre/utils/measure'
formatDistance(1234) // -> "1.23 km"
formatArea(1_200_000) // -> "1.20 km²"
```
