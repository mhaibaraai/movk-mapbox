export function useCategory() {
  const categories = {
    'getting-started': [
      {
        id: 'intro',
        title: '入门',
        icon: 'i-lucide-rocket'
      },
      {
        id: 'frameworks',
        title: '框架集成',
        icon: 'i-lucide-blocks'
      }
    ],
    'core': [
      {
        id: 'basics',
        title: '基础',
        icon: 'i-lucide-box'
      },
      {
        id: 'overlay',
        title: '标注与浮层',
        icon: 'i-lucide-map-pin'
      }
    ],
    'layers': [
      {
        id: 'builtin',
        title: '内置类型',
        icon: 'i-lucide-shapes'
      },
      {
        id: 'data-driven',
        title: '数据驱动',
        icon: 'i-lucide-database'
      },
      {
        id: 'buffers',
        title: '缓冲区',
        icon: 'i-lucide-circle-dashed'
      }
    ],
    'controls': [
      {
        id: 'interactive',
        title: '交互控件',
        icon: 'i-lucide-mouse-pointer-click'
      },
      {
        id: 'info',
        title: '信息控件',
        icon: 'i-lucide-info'
      }
    ],
    'effects': [
      {
        id: 'dynamic',
        title: '动态',
        icon: 'i-lucide-activity'
      },
      {
        id: 'building',
        title: '建筑',
        icon: 'i-lucide-building-2'
      },
      {
        id: 'annotation',
        title: '标注',
        icon: 'i-lucide-map-pin'
      }
    ],
    'environment': [
      {
        id: 'ambience',
        title: '场景氛围',
        icon: 'i-lucide-mountain'
      },
      {
        id: 'weather',
        title: '天气与温度',
        icon: 'i-lucide-cloud-rain'
      }
    ],
    'extensions': [
      {
        id: 'draw',
        title: '绘制',
        icon: 'i-lucide-pencil-ruler'
      },
      {
        id: 'basemap',
        title: '底图与坐标',
        icon: 'i-lucide-map'
      }
    ],
    'composables': [
      {
        id: 'context',
        title: '上下文注入',
        icon: 'i-lucide-network'
      },
      {
        id: 'interaction',
        title: '相机与交互',
        icon: 'i-lucide-mouse-pointer-click'
      },
      {
        id: 'icon-export',
        title: '图标与导出',
        icon: 'i-lucide-download'
      }
    ],
    'utils': [
      {
        id: 'geometry',
        title: '几何与样式',
        icon: 'i-lucide-shapes'
      },
      {
        id: 'coordinate',
        title: '坐标与度量',
        icon: 'i-lucide-locate-fixed'
      }
    ]
  }
  return {
    categories
  }
}
