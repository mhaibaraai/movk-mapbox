# Task recipes

Self-contained snippets for common tasks. Each `<MapboxMap>` needs a parent with explicit height (e.g. `class="h-115"`).

## GeoJSON point / line / fill layer

Set `MapboxLayer` `type` and drive style through `paint`:

```vue
<!-- points -->
<MapboxLayer
  layer-id="points" type="circle"
  :source="{ type: 'geojson', data: '/points.geojson' }"
  :paint="{ 'circle-radius': 6, 'circle-color': '#e11d48', 'circle-stroke-width': 1, 'circle-stroke-color': '#fff' }"
/>

<!-- line -->
<MapboxLayer
  layer-id="route" type="line"
  :source="{ type: 'geojson', data: '/route.geojson' }"
  :layout="{ 'line-cap': 'round', 'line-join': 'round' }"
  :paint="{ 'line-color': '#3b82f6', 'line-width': 4 }"
/>

<!-- fill -->
<MapboxLayer
  layer-id="area" type="fill"
  :source="{ type: 'geojson', data: '/area.geojson' }"
  :paint="{ 'fill-color': '#22c55e', 'fill-opacity': 0.4, 'fill-outline-color': '#16a34a' }"
/>
```

Two layers can share one inline source by repeating the same `:source`, or use `MapboxSource` + `source="id"`. For paint/layout keys per type, call the MCP tool `get-layer-paint-schema`.

## Tianditu (天地图) basemap

Use an empty Mapbox style as the base, then overlay Tianditu. `layer` is `vec` / `img` / `ter`; `annotation` adds labels. Needs `tiandituToken`.

```vue
<MapboxMap :options="{ style: 'mapbox://styles/mapbox/empty-v9', center: [116.397, 39.908], zoom: 10 }">
  <MapboxTiandituLayer layer="vec" annotation />
</MapboxMap>
```

## Coordinate conversion (WGS84 / GCJ02 / BD09)

Tianditu uses WGS84; Amap/Tencent use GCJ02; Baidu uses BD09. Convert before overlaying to avoid offset.

```ts
import { transformPoint, transformGeoJSON } from '@movk/mapbox/utils/coordinate'

const gcj02 = transformPoint([121.4737, 31.2304], 'WGS84', 'GCJ02')
const fixed = transformGeoJSON(featureCollection, 'GCJ02', 'WGS84')
```

The MCP tool `convert-coordinates` does the same conversion on demand.

## Drawing

`MapboxDrawControl` exposes drawn features via `v-model:features`. Merge `movkDrawModes` for rectangle/circle/ellipse/sector; theme with `drawThemeStyles`.

```vue
<script setup lang="ts">
import MapboxDraw from '@mapbox/mapbox-gl-draw'
const features = ref([])
const options = {
  displayControlsDefault: false,
  modes: { ...MapboxDraw.modes, ...movkDrawModes },
  styles: drawThemeStyles({ color: '#8b5cf6' })
}
</script>

<template>
  <MapboxDrawControl v-model:features="features" :options="options" position="top-left" />
</template>
```

Call `drawRef?.changeMode('draw_rectangle' | 'draw_circle' | 'draw_ellipse' | 'draw_sector')` via a template ref to switch modes.

## Buffer and measurement

Buffer components wrap `@turf/*` (radius in meters): `MapboxBufferCircle`, `MapboxBufferEllipse`, `MapboxBufferLine`, `MapboxBufferPolygon`, `MapboxBufferSector`.

```vue
<MapboxBufferCircle :center="[116.397, 39.908]" :radius="2000" color="#3b82f6" />
```

Formatting helpers:

```ts
import { formatArea, formatDistance } from '@movk/mapbox/utils/measure'
formatDistance(1234) // -> "1.23 km"
formatArea(1_200_000) // -> "1.20 km²"
```
