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
  aiChat: {
    faqQuestions: [
      {
        category: '集成与上手',
        items: [
          'Nuxt 4 如何安装并配置 token？',
          'Vue + Vite 项目怎么接入？',
          'center / zoom 怎么 v-model 绑定？'
        ]
      },
      {
        category: '数据与图层',
        items: [
          '如何添加 circle / fill / line 图层？',
          '怎么做点聚合与热力图？',
          'useFeatureState 怎么做高亮？'
        ]
      },
      {
        category: '标注与动效',
        items: [
          '如何添加 Marker / Popup 标注？',
          '怎么叠加 3D 建筑与动态效果？',
          'fog / terrain / 雨雪怎么开启？'
        ]
      },
      {
        category: '本土化与工具',
        items: [
          '怎么接入天地图 / WMS / WMTS？',
          'GCJ02 / BD09 坐标怎么转换？',
          '如何绘制要素并导出图片？'
        ]
      }
    ]
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
