export function useHeader() {
  const { t } = useI18n()
  const { localePath } = useMovkI18n()
  const route = useRoute()

  const isActive = (path: string) => route.path.startsWith(localePath(path))

  const desktopLinks = computed(() => [{
    label: t('nav.docs'),
    to: localePath('/docs/getting-started'),
    active: isActive('/docs')
  }, {
    label: t('nav.releases'),
    to: localePath('/releases')
  }])

  const docsNav = [
    { key: 'quickstart', icon: 'i-lucide-square-play', slug: 'getting-started' },
    { key: 'core', icon: 'i-lucide-box', slug: 'core' },
    { key: 'layers', icon: 'i-lucide-layers', slug: 'layers' },
    { key: 'controls', icon: 'i-lucide-sliders-horizontal', slug: 'controls' },
    { key: 'effects', icon: 'i-lucide-sparkles', slug: 'effects' },
    { key: 'environment', icon: 'i-lucide-cloud-sun', slug: 'environment' },
    { key: 'extensions', icon: 'i-lucide-puzzle', slug: 'extensions' },
    { key: 'composables', icon: 'i-lucide-square-function', slug: 'composables' },
    { key: 'utils', icon: 'i-lucide-wrench', slug: 'utils' }
  ]

  const mobileLinks = computed(() => [
    ...docsNav.map(({ key, icon, slug }) => ({
      label: t(`nav.${key}`),
      icon,
      to: localePath(`/docs/${slug}`),
      active: isActive(`/docs/${slug}`)
    })),
    {
      label: t('nav.releases'),
      icon: 'i-lucide-newspaper',
      to: localePath('/releases')
    },
    {
      label: t('nav.github'),
      to: 'https://github.com/mhaibaraai/movk-mapbox',
      icon: 'i-simple-icons-github',
      target: '_blank'
    }
  ])

  return {
    desktopLinks,
    mobileLinks
  }
}
