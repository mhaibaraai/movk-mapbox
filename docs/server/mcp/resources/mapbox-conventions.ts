interface Convention {
  topic: string
  rule: string
  why: string
}

// Hard constraints for writing correct declarative @movk/mapbox code.
// Kept in sync with the Skill's references/conventions.md.
const conventions: Convention[] = [
  {
    topic: 'SSR safety',
    rule: 'Use <MapboxMap> and child components directly; no <ClientOnly> wrapper is needed.',
    why: 'The map instance is created only on the client in onMounted; components are already SSR-safe.'
  },
  {
    topic: 'Container height',
    rule: 'MapboxMap fills width:100%;height:100%, so the parent must have an explicit height (e.g. class="h-115"), otherwise the map is invisible.',
    why: 'With no height the container collapses to 0 and the map does not render.'
  },
  {
    topic: 'Strip undefined from options',
    rule: 'Run option objects through omitUndefined (@movk/core) before passing them to the mapbox API.',
    why: 'mapbox checks fields with `key in options`; a leftover undefined pollutes the camera matrix (+undefined → NaN).'
  },
  {
    topic: 'Camera v-model',
    rule: 'Bind center/zoom/bearing/pitch with v-model; internally diff against the map\'s current value and only push when it differs.',
    why: 'Writing back unconditionally creates a feedback loop with the map\'s own move events.'
  },
  {
    topic: 'Layer lifecycle',
    rule: 'In child components create source/layer in onReady, apply incremental updates in watch, and tear down in onUnmounted; when referencing a not-yet-ready source, listen for sourcedata and wait.',
    why: 'onReady re-runs on initial load and after every setStyle, so layers rebuild automatically when the basemap changes.'
  },
  {
    topic: 'Component naming',
    rule: 'Custom component file names must be globally unique, even across different subdirectories.',
    why: 'Components resolve by bare file name, so duplicates collide.'
  },
  {
    topic: 'Token injection',
    rule: 'Inject Mapbox / Tianditu tokens via runtimeConfig.public.mapbox instead of hardcoding; prefer environment variables.',
    why: 'Components read from runtimeConfig when creating the map on the client; the singleton config is shared across the Nuxt/Vue dual build.'
  }
]

export default defineMcpResource({
  uri: 'resource://docs/mapbox-conventions',
  description: 'Key conventions and gotchas for writing correct declarative @movk/mapbox code (SSR safety, container height, omitUndefined, camera v-model, layer lifecycle, unique component names, token injection).',
  cache: '1h',
  async handler(uri: URL) {
    return {
      contents: [{
        uri: uri.toString(),
        mimeType: 'application/json',
        text: JSON.stringify({ conventions }, null, 2)
      }]
    }
  }
})
