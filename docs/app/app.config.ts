export default defineAppConfig({
  aside: {
    filter: {
      enabled: true
    }
  },
  toaster: {
    position: 'top-center' as const,
    duration: 3000
  },
  ui: {
    colors: {
      primary: 'blue'
    }
  },
  github: {
    rootDir: 'docs',
    commitPath: 'src/runtime'
  },
  toc: {
    bottom: {
      links: [
        {
          icon: 'i-lucide-message-circle-code',
          to: 'https://mapbox.mhaibaraai.cn/llms.txt',
          target: '_blank',
          label: 'Open LLMs'
        }
      ]
    }
  },
  footer: {
    credits: `Copyright © 2026 - ${new Date().getFullYear()} YiXuan - <span class="text-highlighted">MIT License</span>`,
    socials: [
      {
        'icon': 'i-simple-icons-github',
        'to': 'https://github.com/mhaibaraai/movk-mapbox',
        'target': '_blank',
        'aria-label': 'movk-mapbox on GitHub'
      },
      {
        'icon': 'i-lucide-mail',
        'to': 'mailto:mhaibaraai@gmail.com',
        'target': '_blank',
        'aria-label': 'YiXuan\'s Gmail'
      }
    ]
  }
})
