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

/** 全站示例共享的底图选择；用 useState 跨路由持久化，供顶部切换器与 DemoMap 联动 */
export function useBasemap() {
  const current = useState<BasemapKey>('basemap', () => 'tianditu-vec')

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
