import type { ToasterProps } from '@nuxt/ui'

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'emerald',
      neutral: 'slate'
    }
  },
  toaster: {
    position: 'top-center' as const,
    duration: 2000,
    max: 5,
    expand: true
  } as ToasterProps
})
