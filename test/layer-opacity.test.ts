import { describe, expect, it, vi } from 'vitest'
import { opacityPropsFor, scaleOpacity } from '../src/runtime/utils/layer-opacity'
import { logger } from '../src/runtime/utils/logger'

describe('opacityPropsFor', () => {
  it('按图层类型返回透明度属性', () => {
    expect(opacityPropsFor('fill')).toEqual(['fill-opacity'])
    expect(opacityPropsFor('circle')).toEqual(['circle-opacity', 'circle-stroke-opacity'])
    expect(opacityPropsFor('symbol')).toEqual(['icon-opacity', 'text-opacity'])
    expect(opacityPropsFor('raster')).toEqual(['raster-opacity'])
  })

  it('无透明度属性的类型返回空数组', () => {
    expect(opacityPropsFor('hillshade')).toEqual([])
  })
})

describe('scaleOpacity', () => {
  it('系数为 1 时原样返回', () => {
    const expr = ['get', 'o']
    expect(scaleOpacity(expr, 1)).toBe(expr)
    expect(scaleOpacity(undefined, 1)).toBeUndefined()
  })

  it('数字直接相乘，未设置按默认值 1 计算', () => {
    expect(scaleOpacity(0.8, 0.5)).toBeCloseTo(0.4)
    expect(scaleOpacity(undefined, 0.5)).toBe(0.5)
  })

  it('以 zoom 为输入的 interpolate 逐个缩放输出', () => {
    expect(scaleOpacity(['interpolate', ['linear'], ['zoom'], 5, 0.2, 10, 1], 0.5))
      .toEqual(['interpolate', ['linear'], ['zoom'], 5, 0.1, 10, 0.5])
  })

  it('以 zoom 为输入的 step 逐个缩放输出，数据驱动输出包 *', () => {
    expect(scaleOpacity(['step', ['zoom'], 0, 8, ['get', 'o']], 0.5))
      .toEqual(['step', ['zoom'], 0, 8, ['*', ['get', 'o'], 0.5]])
  })

  it('不含 zoom 的数据驱动表达式整体包 *', () => {
    expect(scaleOpacity(['get', 'o'], 0.5)).toEqual(['*', ['get', 'o'], 0.5])
    expect(scaleOpacity(['interpolate', ['linear'], ['get', 'v'], 0, 0.2, 10, 1], 0.5))
      .toEqual(['*', ['interpolate', ['linear'], ['get', 'v'], 0, 0.2, 10, 1], 0.5])
  })

  it('zoom 不在顶层时原样返回并告警', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const expr = ['case', ['>', ['zoom'], 5], 1, 0.5]
    expect(scaleOpacity(expr, 0.5)).toBe(expr)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})
