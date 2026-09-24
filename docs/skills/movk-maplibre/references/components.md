# Component catalog

Components are auto-imported with the `Maplibre` prefix. For full props use the MCP tool `get-component` / `get-component-metadata` or the docs at `https://maplibre.mhaibaraai.cn`. Below are the most common ones with minimal usage.

## MaplibreMap

Root component. Provides the map context to children. Camera params are two-way via `v-model`.

```vue
<MaplibreMap
  v-model:center="center"
  v-model:zoom="zoom"
  :options="{ style: 'https://tiles.openfreemap.org/styles/liberty' }"
/>
```

`options` is passed to the MapLibre GL `Map` constructor (style, center, zoom, bearing, pitch, ...).

## MaplibreSource

Declares a shared source referenced by layers via `source-id`.

```vue
<MaplibreSource source-id="cities" :source="{ type: 'geojson', data: '/cities.geojson' }" />
<MaplibreLayer layer-id="city-dots" type="circle" source="cities" :paint="{ 'circle-radius': 5 }" />
```

## MaplibreLayer

Renders one layer. `source` accepts an inline spec or a referenced source id string.

```vue
<MaplibreLayer
  layer-id="zone-fill"
  type="fill"
  :source="{ type: 'geojson', data }"
  :paint="{ 'fill-color': '#f43f5e', 'fill-opacity': 0.3 }"
/>
```

Specialized layer components also exist: `MaplibreBuildingLayer`, `MaplibreClusterLayer`, `MaplibreImageLayer`, `MaplibreRasterLayer`, `MaplibreVideoLayer`, plus `MaplibreCustomLayer` and `MaplibreLayerGroup`.

## MaplibreMarker / MaplibrePopup / MaplibreTooltip

Markers position by `lnglat` (`v-model:lnglat` for draggable). The default slot renders custom HTML; with no slot a default pin is used.

```vue
<MaplibreMarker v-model:lnglat="position">
  <div class="rounded bg-primary px-2 py-0.5 text-xs text-inverted">Here</div>
</MaplibreMarker>
```

`MaplibreLottieMarker` renders a Lottie animation as a marker.

## Controls

`MaplibreNavigationControl`, `MaplibreFullscreenControl`, `MaplibreGlobeControl`, `MaplibreGeolocateControl`, `MaplibreScaleControl`, `MaplibreAttributionControl`. All take a `position` (`top-left` / `top-right` / `bottom-left` / `bottom-right`).

```vue
<MaplibreNavigationControl position="top-right" />
```

## MaplibreProjection

Sets the map projection via `setProjection`. `type` defaults to `'globe'` and also accepts `'mercator'`, `'vertical-perspective'` or a zoom interpolation expression; `options` (full `ProjectionSpecification`) overrides `type`. Reapplied after `setStyle`; unmounting restores the projection declared by the style (mercator if none). Mount one per map.

```vue
<MaplibreProjection />
<MaplibreProjection :type="['interpolate', ['linear'], ['zoom'], 10, 'vertical-perspective', 12, 'mercator']" />
```

`MaplibreGlobeControl` toggles globe / mercator by button; it treats an expression projection as non-mercator.

## Tianditu basemap (extension)

`MaplibreTiandituLayer` overlays a 天地图 basemap. The `layer` prop is `vec` (vector) / `img` (imagery) / `ter` (terrain); `annotation` toggles label overlay. Requires `tk`.

```vue
<MaplibreMap :options="{ center: [116.397, 39.908], zoom: 10 }">
  <MaplibreTiandituLayer layer="vec" annotation />
</MaplibreMap>
```

Also available: `MaplibreWmsLayer`, `MaplibreWmtsLayer`.

## Drawing (extension)

`MaplibreDrawControl` adds terra-draw drawing tools with a built-in toolbar; the drawn features are exposed via `v-model:features` and the current mode via `v-model:mode`.

```vue
<MaplibreDrawControl v-model:features="features" position="top-left" />
```

See [recipes.md](recipes.md) for `modes` / `theme` / `toolbar`.
