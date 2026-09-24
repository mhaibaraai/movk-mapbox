import { describe, expect, it, vi } from 'vitest'
import { TerraDrawPointMode } from 'terra-draw'
import type { GeoJSONStoreFeatures } from 'terra-draw'
import { DRAW_MODE_NAMES, resolveDrawModes } from '../src/runtime/domains/map/draw-modes'
import type { DrawMode } from '../src/runtime/types'
import { logger } from '../src/runtime/utils/logger'

type StyleFn = (feature: GeoJSONStoreFeatures) => unknown
type SelectFlags = Record<string, { feature?: { draggable?: boolean, coordinates?: { draggable?: boolean } } }>

function flagsOf(modes: DrawMode[]): SelectFlags {
  return (modes.find(mode => mode.mode === 'select') as unknown as { flags: SelectFlags }).flags
}

describe('resolveDrawModes', () => {
  it('按模式名解析内置模式，顺序与入参一致', () => {
    expect(resolveDrawModes(DRAW_MODE_NAMES).map(mode => mode.mode)).toEqual([...DRAW_MODE_NAMES])
    expect(resolveDrawModes(['rectangle', 'select']).map(mode => mode.mode)).toEqual(['rectangle', 'select'])
  })

  it('选择模式按已注册模式生成 flags：点线面可编辑顶点，其余仅整体拖拽', () => {
    const custom = new TerraDrawPointMode({ modeName: 'marker' }) as unknown as DrawMode
    const flags = flagsOf(resolveDrawModes(['select', 'polygon', 'circle', custom]))

    expect(Object.keys(flags).sort()).toEqual(['circle', 'marker', 'polygon'])
    expect(flags.polygon?.feature?.coordinates?.draggable).toBe(true)
    expect(flags.circle?.feature?.draggable).toBe(true)
    expect(flags.circle?.feature?.coordinates).toBeUndefined()
    expect(flags.marker?.feature?.draggable).toBe(true)
  })

  it('主题注入按名解析的模式', () => {
    const polygon = resolveDrawModes(['polygon'], { color: '#112233' })[0]!
    const fill = (polygon.styles as Record<string, unknown>).fillColor as StyleFn
    expect(fill({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [0, 0] } } as GeoJSONStoreFeatures)).toBe('#112233')
  })

  it('terra-draw 实例原样透传，不套主题', () => {
    const custom = new TerraDrawPointMode() as unknown as DrawMode
    const [resolved] = resolveDrawModes([custom], { color: '#112233' })
    expect(resolved).toBe(custom)
    expect((resolved!.styles as Record<string, unknown>).pointColor).toBeUndefined()
  })

  it('未知模式名告警并跳过', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const names = resolveDrawModes(['polygon', 'hexagon' as never]).map(mode => mode.mode)
    expect(names).toEqual(['polygon'])
    expect(warn).toHaveBeenCalledOnce()
    warn.mockRestore()
  })

  it('每次调用返回新实例，避免多个控件共享模式状态', () => {
    const [a] = resolveDrawModes(['select'])
    const [b] = resolveDrawModes(['select'])
    expect(a).not.toBe(b)
  })
})
