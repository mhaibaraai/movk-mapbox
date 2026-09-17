import { describe, expect, it } from 'vitest'
import type { GeoJSONStoreFeatures, TerraDrawSelectMode } from 'terra-draw'
import { DRAW_MODE_NAMES, movkDrawModes } from '../src/runtime/draw-modes'

type StyleFn = (feature: GeoJSONStoreFeatures) => unknown

describe('movkDrawModes', () => {
  it('返回选择模式与全部内置绘制模式，模式名唯一', () => {
    const names = movkDrawModes().map(mode => mode.mode)
    expect(names).toEqual(['select', ...DRAW_MODE_NAMES])
    expect(new Set(names).size).toBe(names.length)
  })

  it('选择模式为每个绘制模式开启拖拽', () => {
    const select = movkDrawModes()[0] as TerraDrawSelectMode
    const flags = (select as unknown as { flags: Record<string, { feature?: { draggable?: boolean } }> }).flags
    for (const name of DRAW_MODE_NAMES) {
      expect(flags[name]?.feature?.draggable).toBe(true)
    }
  })

  it('主题色注入各模式样式', () => {
    const modes = movkDrawModes({ theme: { color: '#112233' } })
    const polygon = modes.find(mode => mode.mode === 'polygon')!
    const fill = (polygon.styles as Record<string, unknown>).fillColor as StyleFn
    expect(fill({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } } as GeoJSONStoreFeatures)).toBe('#112233')
  })

  it('每次调用返回新实例，避免多个控件共享模式状态', () => {
    const [a] = movkDrawModes()
    const [b] = movkDrawModes()
    expect(a).not.toBe(b)
  })
})
