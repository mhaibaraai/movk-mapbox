import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec'
import { logger } from './logger'

type LayerType = LayerSpecification['type']

// 各图层类型的透明度 paint 属性；无透明度属性的类型（如 hillshade）不参与缩放
const OPACITY_PROPS: Partial<Record<LayerType, readonly string[]>> = {
  'fill': ['fill-opacity'],
  'line': ['line-opacity'],
  'circle': ['circle-opacity', 'circle-stroke-opacity'],
  'symbol': ['icon-opacity', 'text-opacity'],
  'raster': ['raster-opacity'],
  'fill-extrusion': ['fill-extrusion-opacity'],
  'heatmap': ['heatmap-opacity'],
  'background': ['background-opacity']
}

/** 图层类型对应的透明度属性 */
export function opacityPropsFor(type: LayerType): readonly string[] {
  return OPACITY_PROPS[type] ?? []
}

function containsZoom(value: unknown): boolean {
  if (!Array.isArray(value)) return false
  if (value[0] === 'zoom' && value.length === 1) return true
  return value.some(containsZoom)
}

function isZoomInput(value: unknown): boolean {
  return Array.isArray(value) && value[0] === 'zoom' && value.length === 1
}

// 输出位置的值：数字直接乘，数据驱动表达式包 *；含 zoom 则无法安全缩放
function scaleOutput(value: unknown, factor: number): unknown {
  if (typeof value === 'number') return value * factor
  if (containsZoom(value)) return undefined
  return ['*', value, factor]
}

// 以 zoom 为输入的 interpolate / step 只能出现在顶层，改为逐个缩放输出值
function scaleZoomCurve(expr: unknown[], factor: number): unknown[] | undefined {
  const [op] = expr
  const outputStart = op === 'interpolate' ? 4 : 2
  const scaled = [...expr]
  for (let i = outputStart; i < expr.length; i += 2) {
    const next = scaleOutput(expr[i], factor)
    if (next === undefined) return undefined
    scaled[i] = next
  }
  return scaled
}

let warned = false

/** 透明度按系数缩放；系数为 1 时原样返回，未设置视为默认值 1 */
export function scaleOpacity(value: unknown, factor: number): unknown {
  if (factor === 1) return value
  if (value === undefined) return factor
  if (typeof value === 'number') return value * factor
  if (Array.isArray(value)) {
    const [op] = value
    const input = op === 'interpolate' ? value[2] : op === 'step' ? value[1] : undefined
    if (isZoomInput(input)) {
      const scaled = scaleZoomCurve(value, factor)
      if (scaled) return scaled
    } else if (!containsZoom(value)) {
      return ['*', value, factor]
    }
  }
  if (!warned) {
    warned = true
    logger.warn('Opacity expression cannot be scaled safely (zoom used outside a top-level interpolate/step); layer group opacity is ignored for it.', value)
  }
  return value
}
