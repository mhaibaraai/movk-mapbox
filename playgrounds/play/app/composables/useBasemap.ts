import type { StyleSpecification } from '@maplibre/maplibre-gl-style-spec'
import type { TiandituLayerType } from '#maplibre/utils/tianditu'

export type BasemapKey = 'maplibre-light' | 'maplibre-dark' | 'tianditu-vec' | 'tianditu-img' | 'tianditu-ter'

interface BasemapOption {
  label: string
  value: BasemapKey
  icon: string
}

// 天地图为栅格叠加层，底图用空白样式；切换时需显式对象才能触发 setStyle 重置
const BLANK_STYLE: StyleSpecification = { version: 8, sources: {}, layers: [] }

const STYLE: Record<BasemapKey, string | StyleSpecification> = {
  'maplibre-light': 'https://tiles.openfreemap.org/styles/positron',
  'maplibre-dark': 'https://tiles.openfreemap.org/styles/dark',
  'tianditu-vec': BLANK_STYLE,
  'tianditu-img': BLANK_STYLE,
  'tianditu-ter': BLANK_STYLE
}

const options: BasemapOption[] = [
  { label: 'MapLibre 亮色', value: 'maplibre-light', icon: 'i-lucide-sun' },
  { label: 'MapLibre 暗色', value: 'maplibre-dark', icon: 'i-lucide-moon' },
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
