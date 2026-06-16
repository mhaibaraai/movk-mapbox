export function useHeader() {
  const route = useRoute()

  const desktopLinks = computed(() => [{
    label: '文档',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/')
  }, {
    label: '版本发布',
    to: '/releases'
  }])

  const mobileLinks = computed(() => [{
    label: '快速开始',
    icon: 'i-lucide-square-play',
    to: '/docs/getting-started',
    active: route.path.startsWith('/docs/getting-started')
  }, {
    label: '核心组件',
    icon: 'i-lucide-box',
    to: '/docs/core',
    active: route.path.startsWith('/docs/core')
  }, {
    label: '图层',
    icon: 'i-lucide-layers',
    to: '/docs/layers',
    active: route.path.startsWith('/docs/layers')
  }, {
    label: '控件',
    icon: 'i-lucide-sliders-horizontal',
    to: '/docs/controls',
    active: route.path.startsWith('/docs/controls')
  }, {
    label: '效果',
    icon: 'i-lucide-sparkles',
    to: '/docs/effects',
    active: route.path.startsWith('/docs/effects')
  }, {
    label: '环境',
    icon: 'i-lucide-cloud-sun',
    to: '/docs/environment',
    active: route.path.startsWith('/docs/environment')
  }, {
    label: '扩展',
    icon: 'i-lucide-puzzle',
    to: '/docs/extensions',
    active: route.path.startsWith('/docs/extensions')
  }, {
    label: 'Composables',
    icon: 'i-lucide-square-function',
    to: '/docs/composables',
    active: route.path.startsWith('/docs/composables')
  }, {
    label: '工具函数',
    icon: 'i-lucide-wrench',
    to: '/docs/utils',
    active: route.path.startsWith('/docs/utils')
  }, {
    label: '版本发布',
    icon: 'i-lucide-newspaper',
    to: '/releases'
  }, {
    label: 'GitHub',
    to: 'https://github.com/mhaibaraai/movk-mapbox',
    icon: 'i-simple-icons-github',
    target: '_blank'
  }])

  return {
    desktopLinks,
    mobileLinks
  }
}
