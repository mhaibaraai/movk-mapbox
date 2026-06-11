import type { TiandituLayerType } from '#mapbox/utils/tianditu'

export type BasemapKey = 'mapbox-light' | 'mapbox-dark' | 'tianditu-vec' | 'tianditu-img' | 'tianditu-ter'

interface BasemapOption {
  label: string
  value: BasemapKey
  icon: string
}

const STYLE: Record<BasemapKey, string> = {
  'mapbox-light': 'mapbox://styles/mapbox/light-v11',
  'mapbox-dark': 'mapbox://styles/mapbox/dark-v11',
  'tianditu-vec': 'mapbox://styles/mapbox/empty-v9',
  'tianditu-img': 'mapbox://styles/mapbox/empty-v9',
  'tianditu-ter': 'mapbox://styles/mapbox/empty-v9'
}

const options: BasemapOption[] = [
  { label: 'Mapbox 亮色', value: 'mapbox-light', icon: 'i-lucide-sun' },
  { label: 'Mapbox 暗色', value: 'mapbox-dark', icon: 'i-lucide-moon' },
  { label: '天地图 矢量', value: 'tianditu-vec', icon: 'i-lucide-map' },
  { label: '天地图 影像', value: 'tianditu-img', icon: 'i-lucide-satellite' },
  { label: '天地图 地形', value: 'tianditu-ter', icon: 'i-lucide-mountain' }
]

// 模块级单例 ref：跨路由/跨组件共享底图选择，兼容 Nuxt 与纯 Vue 两个 playground（纯 Vue 无 useState）
const current = ref<BasemapKey>('tianditu-vec')

/** 全站示例共享的底图选择，供顶部切换器与 DemoMap 联动 */
export function useBasemap() {
  const style = computed(() => STYLE[current.value])
  const isTianditu = computed(() => current.value.startsWith('tianditu'))
  const tiandituLayer = computed<TiandituLayerType | undefined>(() =>
    current.value === 'tianditu-vec'
      ? 'vec'
      : current.value === 'tianditu-img'
        ? 'img'
        : current.value === 'tianditu-ter'
          ? 'ter'
          : undefined
  )

  return { current, options, style, isTianditu, tiandituLayer }
}
