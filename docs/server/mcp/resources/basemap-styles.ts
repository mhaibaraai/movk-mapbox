// Available basemap presets. Official Mapbox styles go straight to MapboxMap's
// options.style; Tianditu (Chinese basemap) is overlaid via MapboxTiandituLayer
// (layer types defined in src/runtime/utils/tianditu.ts).
const mapboxStyles = [
  { id: 'streets', style: 'mapbox://styles/mapbox/streets-v12', description: 'Standard street map' },
  { id: 'light', style: 'mapbox://styles/mapbox/light-v11', description: 'Light basemap' },
  { id: 'dark', style: 'mapbox://styles/mapbox/dark-v11', description: 'Dark basemap' },
  { id: 'satellite', style: 'mapbox://styles/mapbox/satellite-v9', description: 'Satellite imagery' },
  { id: 'satellite-streets', style: 'mapbox://styles/mapbox/satellite-streets-v12', description: 'Satellite imagery with street labels' },
  { id: 'outdoors', style: 'mapbox://styles/mapbox/outdoors-v12', description: 'Outdoor terrain map' },
  { id: 'standard', style: 'mapbox://styles/mapbox/standard', description: '3D Standard style' }
]

// Tianditu layer types: basemaps and their matching annotation layers.
const tiandituLayers = [
  { type: 'vec', description: 'Vector basemap', annotation: 'cva' },
  { type: 'img', description: 'Imagery basemap', annotation: 'cia' },
  { type: 'ter', description: 'Terrain hillshade', annotation: 'cta' },
  { type: 'cva', description: 'Vector annotation', annotation: null },
  { type: 'cia', description: 'Imagery annotation', annotation: null },
  { type: 'cta', description: 'Terrain annotation', annotation: null }
]

const usage = {
  mapbox: 'Pass to MapboxMap options.style, e.g. :options="{ style: \'mapbox://styles/mapbox/streets-v12\' }".',
  tianditu: 'Overlay inside MapboxMap with <MapboxTiandituLayer layer="vec" annotation />; the `layer` prop accepts vec/img/ter and `annotation` toggles labels. Requires tiandituToken.'
}

export default defineMcpResource({
  uri: 'resource://docs/basemap-styles',
  description: 'Available basemap presets for @movk/mapbox: official Mapbox styles (pass to MapboxMap options.style) and Tianditu layer types vec/img/ter (overlay via MapboxTiandituLayer).',
  cache: '1h',
  async handler(uri: URL) {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify({ mapboxStyles, tianditu: { layers: tiandituLayers }, usage }, null, 2)
      }]
    }
  }
})
