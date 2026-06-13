import { describe, expect, it } from 'vitest'
import { arcLine, createLineSampler, radarSweepImage, ringFade, ringProgress, trailGradient } from '../src/runtime/utils/effects'

describe('arcLine', () => {
  const from: [number, number] = [116, 39]
  const to: [number, number] = [120, 39]

  it('端点精确等于起讫点，点数为 segments+1', () => {
    const coords = arcLine(from, to, { segments: 32 })
    expect(coords).toHaveLength(33)
    expect(coords[0]).toEqual(from)
    expect(coords[32]).toEqual(to)
  })

  it('弧顶在中点垂直偏移方向，曲率 0 退化为直线', () => {
    const curved = arcLine(from, to, { curvature: 0.5, segments: 2 })
    // segments=2 时中间点即贝塞尔 t=0.5 顶点，纬度偏离基线
    expect(curved[1]![1]).not.toBeCloseTo(39, 5)

    const straight = arcLine(from, to, { curvature: 0, segments: 2 })
    expect(straight[1]![0]).toBeCloseTo(118, 8)
    expect(straight[1]![1]).toBeCloseTo(39, 8)
  })
})

describe('createLineSampler', () => {
  it('t=0/1 取端点，直线 t=0.5 取中点', () => {
    const sample = createLineSampler([[0, 0], [10, 0]])
    expect(sample(0)).toEqual([0, 0])
    expect(sample(1)).toEqual([10, 0])
    expect(sample(0.5)).toEqual([5, 0])
  })

  it('按累计长度而非顶点序号插值', () => {
    // 两段长度 1:3，t=0.25 应落在第一段终点
    const sample = createLineSampler([[0, 0], [1, 0], [4, 0]])
    expect(sample(0.25)![0]).toBeCloseTo(1, 8)
  })

  it('越界 t 截断到端点', () => {
    const sample = createLineSampler([[0, 0], [10, 0]])
    expect(sample(-0.5)).toEqual([0, 0])
    expect(sample(1.5)).toEqual([10, 0])
  })
})

describe('ringProgress', () => {
  it('随时间线性推进且按圈序相位错开，周期归零', () => {
    expect(ringProgress(0, 2, 0, 1000)).toBe(0)
    expect(ringProgress(0, 2, 500, 1000)).toBeCloseTo(0.5, 8)
    expect(ringProgress(0, 2, 1000, 1000)).toBe(0)
    // 第二圈相位偏移 1/2 周期
    expect(ringProgress(1, 2, 0, 1000)).toBeCloseTo(0.5, 8)
  })
})

describe('ringFade', () => {
  it('两端为 0、中点峰值 1，保证取模回绕处无缝', () => {
    expect(ringFade(0)).toBe(0)
    expect(ringFade(1)).toBeCloseTo(0, 8)
    expect(ringFade(0.5)).toBeCloseTo(1, 8)
  })

  it('相位全程不透明度非负', () => {
    for (let p = 0; p <= 1; p += 0.1) expect(ringFade(p)).toBeGreaterThanOrEqual(0)
  })
})

describe('trailGradient', () => {
  function stopInputs(expr: unknown[]): number[] {
    // 表达式前三项为 interpolate 头部，之后 [input, color] 交替
    return expr.slice(3).filter((_, i) => i % 2 === 0) as number[]
  }

  it('停靠点严格递增且落在 [0,1]', () => {
    for (const head of [0, 0.001, 0.3, 0.95, 1, 1.2]) {
      const inputs = stopInputs(trailGradient(head, 0.25, '#0f0'))
      for (let i = 1; i < inputs.length; i++) {
        expect(inputs[i]!).toBeGreaterThan(inputs[i - 1]!)
      }
      expect(inputs[0]).toBeGreaterThanOrEqual(0)
      expect(inputs[inputs.length - 1]).toBeLessThanOrEqual(1)
    }
  })

  it('头部位于 head，其后紧跟透明截断；head=1 时无截断停靠点', () => {
    const expr = trailGradient(0.5, 0.2, '#0f0')
    expect(expr).toContain('#0f0')
    expect(stopInputs(expr)).toHaveLength(3)

    const atEnd = trailGradient(1, 0.2, '#0f0')
    expect(stopInputs(atEnd)).toHaveLength(2)
  })
})

describe('radarSweepImage', () => {
  it('无 2d canvas 环境时优雅返回 undefined', () => {
    // happy-dom 无 canvas 实现，验证守卫分支
    expect(radarSweepImage(64, '#0f0')).toBeUndefined()
  })
})
