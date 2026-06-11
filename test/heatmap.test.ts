import { describe, expect, it } from 'vitest'
import { heatmapPaint } from '../src/runtime/utils/heatmap'

describe('heatmapPaint', () => {
  it('缺省取 temperature 属性与 [0,40] 权重区间', () => {
    const paint = heatmapPaint()
    expect(paint['heatmap-weight']).toEqual([
      'interpolate', ['linear'], ['get', 'temperature'],
      0, 0,
      40, 1
    ])
  })

  it('weightRange 端点线性映射到 0/1', () => {
    const weight = heatmapPaint({ weightRange: [-20, 50] })['heatmap-weight'] as unknown[]
    expect(weight[3]).toBe(-20)
    expect(weight[4]).toBe(0)
    expect(weight[5]).toBe(50)
    expect(weight[6]).toBe(1)
  })

  it('自定义 weightProperty 注入 get 表达式', () => {
    const weight = heatmapPaint({ weightProperty: 'temp_c' })['heatmap-weight'] as unknown[]
    expect(weight[2]).toEqual(['get', 'temp_c'])
  })

  it('heatmap-color 在 density 0 处透明,并依序注入 colorStops', () => {
    const color = heatmapPaint({ colorStops: [[0.5, '#abc'], [1, '#def']] })['heatmap-color'] as unknown[]
    expect(color.slice(0, 5)).toEqual(['interpolate', ['linear'], ['heatmap-density'], 0, 'rgba(0, 0, 0, 0)'])
    expect(color.slice(5)).toEqual([0.5, '#abc', 1, '#def'])
  })

  it('radius/intensity/opacity 缺省与自定义', () => {
    expect(heatmapPaint()).toMatchObject({ 'heatmap-radius': 30, 'heatmap-intensity': 1, 'heatmap-opacity': 1 })
    expect(heatmapPaint({ radius: 50, intensity: 2, opacity: 0.6 })).toMatchObject({
      'heatmap-radius': 50,
      'heatmap-intensity': 2,
      'heatmap-opacity': 0.6
    })
  })
})
