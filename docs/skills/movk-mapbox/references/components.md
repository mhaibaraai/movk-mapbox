# Component catalog

Components are auto-imported with the `Mapbox` prefix. For full props use the MCP tool `get-component` / `get-component-metadata` or the docs at `https://mapbox.mhaibaraai.cn`. Below are the most common ones with minimal usage.

## MapboxMap

Root component. Provides the map context to children. Camera params are two-way via `v-model`.

```vue
<MapboxMap
  v-model:center="center"
  v-model:zoom="zoom"
  :options="{ style: 'mapbox://styles/mapbox/streets-v12' }"
/>
```

`options` is passed to the Mapbox GL `Map` constructor (style, center, zoom, bearing, pitch, ...).

## MapboxSource

Declares a shared source referenced by layers via `source-id`.

```vue
<MapboxSource source-id="cities" :source="{ type: 'geojson', data: '/cities.geojson' }" />
<MapboxLayer layer-id="city-dots" type="circle" source="cities" :paint="{ 'circle-radius': 5 }" />
```

## MapboxLayer

Renders one layer. `source` accepts an inline spec or a referenced source id string.

```vue
<MapboxLayer
  layer-id="zone-fill"
  type="fill"
  :source="{ type: 'geojson', data }"
  :paint="{ 'fill-color': '#f43f5e', 'fill-opacity': 0.3 }"
/>
```

Specialized layer components also exist: `MapboxBuildingLayer`, `MapboxClusterLayer`, `MapboxImageLayer`, `MapboxRasterLayer`, `MapboxVideoLayer`, plus `MapboxCustomLayer` and `MapboxLayerGroup`.

## MapboxMarker / MapboxPopup / MapboxTooltip

Markers position by `lnglat` (`v-model:lnglat` for draggable). The default slot renders custom HTML; with no slot a default pin is used.

```vue
<MapboxMarker v-model:lnglat="position">
  <div class="rounded bg-primary px-2 py-0.5 text-xs text-inverted">Here</div>
</MapboxMarker>
```

`MapboxLottieMarker` renders a Lottie animation as a marker.

## Controls

`MapboxNavigationControl`, `MapboxFullscreenControl`, `MapboxGeolocateControl`, `MapboxScaleControl`, `MapboxAttributionControl`. All take a `position` (`top-left` / `top-right` / `bottom-left` / `bottom-right`).

```vue
<MapboxNavigationControl position="top-right" />
```

## Tianditu basemap (extension)

`MapboxTiandituLayer` overlays a 天地图 basemap. The `layer` prop is `vec` (vector) / `img` (imagery) / `ter` (terrain); `annotation` toggles label overlay. Requires `tiandituToken`.

```vue
<MapboxMap :options="{ style: 'mapbox://styles/mapbox/empty-v9', center: [116.397, 39.908], zoom: 10 }">
  <MapboxTiandituLayer layer="vec" annotation />
</MapboxMap>
```

Also available: `MapboxWmsLayer`, `MapboxWmtsLayer`.

## Drawing (extension)

`MapboxDrawControl` adds drawing tools; the drawn features are exposed via `v-model:features`.

```vue
<MapboxDrawControl v-model:features="features" position="top-left" />
```

See [recipes.md](recipes.md) for `movkDrawModes` / `drawThemeStyles`.
