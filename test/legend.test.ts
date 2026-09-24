import { describe, expect, it } from 'vitest'
import { deriveLegend } from '../src/runtime/utils/legend'

describe('deriveLegend', () => {
  it('字面量颜色生成一项，标签为组标题', () => {
    expect(deriveLegend([{ type: 'fill', paint: { 'fill-color': '#f00' } }], '学校'))
      .toEqual([{ label: '学校', type: 'fill', color: '#f00' }])
  })

  it('match 按取值生成多项，忽略 fallback，数组取值合并为标签', () => {
    const paint = { 'circle-color': ['match', ['get', 'kind'], 'a', '#f00', ['b', 'c'], '#0f0', '#999'] }
    expect(deriveLegend([{ type: 'circle', paint }], '点位')).toEqual([
      { label: 'a', type: 'circle', color: '#f00' },
      { label: 'b, c', type: 'circle', color: '#0f0' }
    ])
  })

  it('step 按区间生成标签', () => {
    const paint = { 'fill-color': ['step', ['get', 'pop'], '#eee', 100, '#aaa', 500, '#333'] }
    expect(deriveLegend([{ type: 'fill', paint }], '人口')).toEqual([
      { label: '< 100', type: 'fill', color: '#eee' },
      { label: '100 – 500', type: 'fill', color: '#aaa' },
      { label: '≥ 500', type: 'fill', color: '#333' }
    ])
  })

  it('interpolate 生成渐变项', () => {
    const paint = { 'fill-extrusion-color': ['interpolate', ['linear'], ['get', 'h'], 0, '#fff', 50, '#f00'] }
    expect(deriveLegend([{ type: 'fill-extrusion', paint }], '高度')).toEqual([
      { label: '0 – 50', type: 'gradient', colors: ['#fff', '#f00'] }
    ])
  })

  it('跳过以 zoom 为输入的表达式与无法识别的表达式', () => {
    const layers = [
      { type: 'line' as const, paint: { 'line-color': ['interpolate', ['linear'], ['zoom'], 5, '#fff', 10, '#000'] } },
      { type: 'circle' as const, paint: { 'circle-color': ['get', 'color'] } },
      { type: 'raster' as const, paint: {} }
    ]
    expect(deriveLegend(layers, 'x')).toEqual([])
  })

  it('同组内相同项去重', () => {
    const layers = [
      { type: 'line' as const, paint: { 'line-color': '#00f' } },
      { type: 'line' as const, paint: { 'line-color': '#00f' } }
    ]
    expect(deriveLegend(layers, '河流')).toHaveLength(1)
  })
})
