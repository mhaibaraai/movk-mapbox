import { z } from 'zod'
import { queryCollection } from '@nuxt/content/server'

const SECTIONS = ['core', 'layers', 'controls', 'effects', 'environment', 'extensions'] as const
const sectionSet = new Set<string>(SECTIONS)

function sectionOf(path: string): string {
  return path.split('/')[2] ?? ''
}

export default defineMcpPrompt({
  description: 'Assemble a declarative @movk/mapbox map for a described task, using only documented components and following the library conventions.',
  inputSchema: {
    task: z.string().describe('What the map should do, e.g. "show clustered points over a Tianditu vector basemap with a navigation control"'),
    framework: z.enum(['nuxt', 'vue']).optional().describe('Target framework: nuxt (auto-import) or vue (Vite plugin)')
  },
  async handler({ task, framework }) {
    const event = useEvent()
    const origin = getRequestURL(event).origin

    const pages = await queryCollection(event, 'docs')
      .select('title', 'description', 'path', 'category')
      .all()

    const candidates = pages
      .filter(page => sectionSet.has(sectionOf(page.path)))
      .filter(page => !(page.path.split('/').pop() ?? '').startsWith('.'))
      .map(page => ({
        name: page.path.split('/').pop() ?? page.path,
        title: page.title,
        description: page.description,
        category: sectionOf(page.path),
        url: `${origin}${page.path}`
      }))

    const target = framework === 'vue' ? 'a Vue + Vite project (components provided by the unplugin/Vite plugin)' : 'a Nuxt project (components auto-imported)'

    const text = [
      `Build a self-contained \`<MapboxMap>\` single-file component for ${target} that accomplishes this task:`,
      ``,
      `"${task}"`,
      ``,
      `Requirements:`,
      `- Use ONLY components that exist in the candidate list below. Do not invent component names.`,
      `- Follow the library conventions in the \`resource://docs/mapbox-conventions\` resource (SSR-safe, explicit container height, camera v-model diffing, omitUndefined, onReady/watch/onUnmounted layer lifecycle).`,
      `- Give the map container an explicit height (e.g. class="h-115").`,
      `- For exact props, call the \`list-mapbox-components\` and \`get-component\` tools; for layer paint/layout keys call \`get-layer-paint-schema\`.`,
      ``,
      `Candidate components/composables (by category):`,
      JSON.stringify(candidates, null, 2)
    ].join('\n')

    return {
      messages: [{
        role: 'user' as const,
        content: {
          type: 'text' as const,
          text
        }
      }]
    }
  }
})
