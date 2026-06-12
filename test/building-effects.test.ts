import { describe, expect, it } from 'vitest'
import { buildingGradientPaint, windowTextureImage } from '../src/runtime/utils/building-effects'

describe('buildingGradientPaint', () => {
  it('默认按高度插值,断点单调且读取要素 height', () => {
    const paint = buildingGradientPaint()
    const colorExpr = paint['fill-extrusion-color'] as unknown[]
    expect(colorExpr[0]).toBe('interpolate')
    expect(JSON.stringify(colorExpr)).toContain('"get","height"')

    // 提取断点高度,验证单调递增
    const heights = colorExpr.slice(3).filter((_, i) => i % 2 === 0) as number[]
    for (let i = 1; i < heights.length; i++) {
      expect(heights[i]!).toBeGreaterThan(heights[i - 1]!)
    }
  })

  it('自定义 stops 与透明度生效', () => {
    const paint = buildingGradientPaint({ stops: [[0, '#000'], [100, '#fff']], opacity: 0.5 })
    expect(paint['fill-extrusion-opacity']).toBe(0.5)
    expect(JSON.stringify(paint['fill-extrusion-color'])).toContain('#fff')
  })
})

describe('windowTextureImage', () => {
  it('无 canvas 环境返回 undefined(happy-dom 无 2d 实现)', () => {
    expect(windowTextureImage({ seed: 1 })).toBeUndefined()
  })
})
