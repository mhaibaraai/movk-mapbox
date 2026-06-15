import { z } from 'zod'

const SPEC_BASE = 'https://docs.mapbox.com/style-spec/reference/layers/'

interface LayerSchema {
  commonPaint: string[]
  commonLayout: string[]
  snippet: string
  glSpecRef: string
}

// MapboxLayer passes paint/layout straight to GL. These list only the common keys
// with a minimal scaffold; for the exhaustive set query mapbox-docs-mcp or the style spec (glSpecRef).
const SCHEMAS: Record<string, LayerSchema> = {
  'circle': {
    commonPaint: ['circle-radius', 'circle-color', 'circle-opacity', 'circle-stroke-width', 'circle-stroke-color'],
    commonLayout: ['circle-sort-key'],
    snippet: `<MapboxLayer
  layer-id="points"
  type="circle"
  :source="{ type: 'geojson', data: '/points.geojson' }"
  :paint="{ 'circle-radius': 6, 'circle-color': '#e11d48', 'circle-stroke-width': 1, 'circle-stroke-color': '#fff' }"
/>`,
    glSpecRef: `${SPEC_BASE}#circle`
  },
  'line': {
    commonPaint: ['line-color', 'line-width', 'line-opacity', 'line-dasharray', 'line-gradient'],
    commonLayout: ['line-cap', 'line-join'],
    snippet: `<MapboxLayer
  layer-id="route"
  type="line"
  :source="{ type: 'geojson', data: '/route.geojson' }"
  :layout="{ 'line-cap': 'round', 'line-join': 'round' }"
  :paint="{ 'line-color': '#3b82f6', 'line-width': 4 }"
/>`,
    glSpecRef: `${SPEC_BASE}#line`
  },
  'fill': {
    commonPaint: ['fill-color', 'fill-opacity', 'fill-outline-color', 'fill-pattern'],
    commonLayout: ['fill-sort-key'],
    snippet: `<MapboxLayer
  layer-id="area"
  type="fill"
  :source="{ type: 'geojson', data: '/area.geojson' }"
  :paint="{ 'fill-color': '#22c55e', 'fill-opacity': 0.4, 'fill-outline-color': '#16a34a' }"
/>`,
    glSpecRef: `${SPEC_BASE}#fill`
  },
  'symbol': {
    commonPaint: ['text-color', 'text-halo-color', 'text-halo-width', 'icon-opacity'],
    commonLayout: ['icon-image', 'icon-size', 'text-field', 'text-size', 'text-anchor', 'symbol-placement'],
    snippet: `<MapboxLayer
  layer-id="labels"
  type="symbol"
  :source="{ type: 'geojson', data: '/points.geojson' }"
  :layout="{ 'text-field': ['get', 'name'], 'text-size': 12, 'text-anchor': 'top' }"
  :paint="{ 'text-color': '#111', 'text-halo-color': '#fff', 'text-halo-width': 1 }"
/>`,
    glSpecRef: `${SPEC_BASE}#symbol`
  },
  'heatmap': {
    commonPaint: ['heatmap-weight', 'heatmap-intensity', 'heatmap-color', 'heatmap-radius', 'heatmap-opacity'],
    commonLayout: [],
    snippet: `<MapboxLayer
  layer-id="heat"
  type="heatmap"
  :source="{ type: 'geojson', data: '/points.geojson' }"
  :paint="{ 'heatmap-radius': 20, 'heatmap-intensity': 1, 'heatmap-opacity': 0.8 }"
/>`,
    glSpecRef: `${SPEC_BASE}#heatmap`
  },
  'fill-extrusion': {
    commonPaint: ['fill-extrusion-color', 'fill-extrusion-height', 'fill-extrusion-base', 'fill-extrusion-opacity'],
    commonLayout: ['fill-extrusion-edge-radius'],
    snippet: `<MapboxLayer
  layer-id="buildings"
  type="fill-extrusion"
  :source="{ type: 'geojson', data: '/buildings.geojson' }"
  :paint="{ 'fill-extrusion-color': '#aaa', 'fill-extrusion-height': ['get', 'height'], 'fill-extrusion-base': 0, 'fill-extrusion-opacity': 0.9 }"
/>`,
    glSpecRef: `${SPEC_BASE}#fill-extrusion`
  },
  'raster': {
    commonPaint: ['raster-opacity', 'raster-brightness-min', 'raster-brightness-max', 'raster-contrast', 'raster-saturation'],
    commonLayout: [],
    snippet: `<MapboxLayer
  layer-id="overlay"
  type="raster"
  :source="{ type: 'raster', tiles: ['https://example.com/{z}/{x}/{y}.png'], tileSize: 256 }"
  :paint="{ 'raster-opacity': 0.8 }"
/>`,
    glSpecRef: `${SPEC_BASE}#raster`
  }
}

const typeEnum = z.enum(['circle', 'line', 'fill', 'symbol', 'heatmap', 'fill-extrusion', 'raster'])

export default defineMcpTool({
  description: 'Get the recommended paint/layout property keys and a minimal MapboxLayer scaffold for a given layer type. MapboxLayer passes paint/layout straight to Mapbox GL, so use this to avoid guessing property names. Omit `type` to list all types.',
  annotations: {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false
  },
  inputSchema: {
    type: typeEnum.optional().describe('Mapbox layer type: circle, line, fill, symbol, heatmap, fill-extrusion, raster')
  },
  inputExamples: [
    {},
    { type: 'circle' },
    { type: 'fill-extrusion' }
  ],
  cache: '1h',
  async handler({ type }) {
    if (type) {
      return { type, schema: SCHEMAS[type] }
    }

    const schemas = Object.fromEntries(
      Object.entries(SCHEMAS).map(([key, value]) => [key, {
        commonPaint: value.commonPaint,
        commonLayout: value.commonLayout,
        glSpecRef: value.glSpecRef
      }])
    )

    return { schemas, total: Object.keys(SCHEMAS).length }
  }
})
