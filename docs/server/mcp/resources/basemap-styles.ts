// Available basemap presets. Keyless OpenFreeMap vector styles (OpenMapTiles schema) go straight to
// MaplibreMap's options.style; omit style for a blank map. Tianditu (Chinese basemap) is overlaid via
// MaplibreTiandituLayer (layer types defined in src/runtime/utils/tianditu.ts).
const vectorStyles = [
  { id: 'liberty', style: 'https://tiles.openfreemap.org/styles/liberty', description: 'Street map with 3D buildings' },
  { id: 'bright', style: 'https://tiles.openfreemap.org/styles/bright', description: 'Bright street map' },
  { id: 'positron', style: 'https://tiles.openfreemap.org/styles/positron', description: 'Light basemap' },
  { id: 'dark', style: 'https://tiles.openfreemap.org/styles/dark', description: 'Dark basemap' },
  { id: 'fiord', style: 'https://tiles.openfreemap.org/styles/fiord', description: 'Dark blue basemap' }
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
  maplibre: 'Pass to MaplibreMap options.style, e.g. :options="{ style: \'https://tiles.openfreemap.org/styles/liberty\' }". Omit style for a blank map (e.g. Tianditu only). Vector sources use the OpenMapTiles schema (building layer: render_height / render_min_height).',
  tianditu: 'Overlay inside MaplibreMap with <MaplibreTiandituLayer layer="vec" annotation />; the `layer` prop accepts vec/img/ter and `annotation` toggles labels. Requires tiandituToken.'
}

export default defineMcpResource({
  uri: 'resource://docs/basemap-styles',
  description: 'Available basemap presets for @movk/maplibre: keyless OpenFreeMap vector styles (pass to MaplibreMap options.style) and Tianditu layer types vec/img/ter (overlay via MaplibreTiandituLayer).',
  cache: '1h',
  async handler(uri: URL) {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify({ vectorStyles, tianditu: { layers: tiandituLayers }, usage }, null, 2)
      }]
    }
  }
})
