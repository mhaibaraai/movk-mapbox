import type { LayerSpecification } from '@maplibre/maplibre-gl-style-spec'
import type { LegendItem } from '../types/layer'

/** 参与图例推导的图层描述 */
export interface LegendLayer {
  type: LayerSpecification['type']
  paint?: Record<string, unknown>
}

type SwatchType = Exclude<LegendItem['type'], 'gradient'>

const COLOR_PROPS: Partial<Record<LayerSpecification['type'], [string, SwatchType]>> = {
  'fill': ['fill-color', 'fill'],
  'line': ['line-color', 'line'],
  'circle': ['circle-color', 'circle'],
  'fill-extrusion': ['fill-extrusion-color', 'fill']
}

const isZoomInput = (value: unknown): boolean => Array.isArray(value) && value[0] === 'zoom'

function fromMatch(expr: unknown[], type: SwatchType): LegendItem[] {
  // ['match', input, label1, color1, label2, color2, ..., fallback]
  const items: LegendItem[] = []
  for (let i = 2; i + 1 < expr.length; i += 2) {
    const [label, color] = [expr[i], expr[i + 1]]
    if (typeof color !== 'string') continue
    items.push({ label: Array.isArray(label) ? label.join(', ') : String(label), type, color })
  }
  return items
}

function fromStep(expr: unknown[], type: SwatchType): LegendItem[] {
  // ['step', input, color0, stop1, color1, ..., stopN, colorN]
  const colors = expr.filter((_, i) => i >= 2 && i % 2 === 0)
  const stops = expr.filter((_, i) => i >= 3 && i % 2 === 1)
  if (colors.some(color => typeof color !== 'string')) return []
  return colors.map((color, i) => {
    const label = i === 0
      ? `< ${stops[0]}`
      : i === stops.length ? `≥ ${stops[i - 1]}` : `${stops[i - 1]} – ${stops[i]}`
    return { label, type, color: color as string }
  })
}

function fromInterpolate(expr: unknown[]): LegendItem[] {
  // ['interpolate', interpolation, input, stop1, color1, ..., stopN, colorN]
  const stops = expr.filter((_, i) => i >= 3 && i % 2 === 1)
  const colors = expr.filter((_, i) => i >= 4 && i % 2 === 0)
  if (!colors.length || colors.some(color => typeof color !== 'string')) return []
  return [{ label: `${stops[0]} – ${stops.at(-1)}`, type: 'gradient', colors: colors as string[] }]
}

function itemsFor(value: unknown, type: SwatchType, title: string): LegendItem[] {
  if (typeof value === 'string') return [{ label: title, type, color: value }]
  if (!Array.isArray(value)) return []
  const [op] = value
  if (op === 'match') return fromMatch(value, type)
  if (op === 'step' && !isZoomInput(value[1])) return fromStep(value, type)
  if (op === 'interpolate' && !isZoomInput(value[2])) return fromInterpolate(value)
  return []
}

/** 由图层颜色推导图例项：支持字面量、match、step、interpolate，同组内去重 */
export function deriveLegend(layers: LegendLayer[], title: string): LegendItem[] {
  const seen = new Set<string>()
  return layers
    .flatMap((layer) => {
      const entry = COLOR_PROPS[layer.type]
      return entry ? itemsFor(layer.paint?.[entry[0]], entry[1], title) : []
    })
    .filter((item) => {
      const key = JSON.stringify(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}
