export function useCategory() {
  const categories = {
    'core': [
      {
        id: 'basics',
        title: '基础',
        icon: 'i-lucide-box'
      },
      {
        id: 'organization',
        title: '图层组织',
        icon: 'i-lucide-layers'
      },
      {
        id: 'overlay',
        title: '标注与浮层',
        icon: 'i-lucide-map-pin'
      }
    ],
    'getting-started': [
      {
        id: 'concepts',
        title: '核心概念',
        icon: 'i-lucide-settings'
      },
      {
        id: 'ai',
        title: 'AI 集成',
        icon: 'i-lucide-bot'
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
    'effects': [
      {
        id: 'building',
        title: '建筑',
        icon: 'i-lucide-building-2'
      },
      {
        id: 'annotation',
        title: '标注',
        icon: 'i-lucide-map-pin'
      },
      {
        id: 'dynamic',
        title: '动态',
        icon: 'i-lucide-activity'
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
        title: '底图服务',
        icon: 'i-lucide-map'
      },
      {
        id: 'coordinate',
        title: '坐标',
        icon: 'i-lucide-locate-fixed'
      }
    ],
    'utils': [
      {
        id: 'geometry',
        title: '几何',
        icon: 'i-lucide-shapes'
      },
      {
        id: 'coordinate',
        title: '坐标',
        icon: 'i-lucide-locate-fixed'
      },
      {
        id: 'misc',
        title: '其他',
        icon: 'i-lucide-wrench'
      }
    ]
  }
  return {
    categories
  }
}
