import { describe, expect, it, vi } from 'vitest'
import type { Position } from 'geojson'
import { drawCircleMode, drawEllipseMode, drawRectangleMode, drawSectorMode, movkDrawModes } from '../src/runtime/draw-modes'

// 模拟 DrawCustomModeThis:newFeature 产出可写坐标/属性的 fake DrawFeature
function mockModeContext() {
  const ctx = {
    features: [] as FakeFeature[],
    newFeature: vi.fn((geojson: { properties?: Record<string, unknown>, geometry: { coordinates: unknown } }) => {
      const feature = new FakeFeature(geojson)
      ctx.features.push(feature)
      return feature
    }),
    addFeature: vi.fn(),
    deleteFeature: vi.fn(),
    clearSelectedFeatures: vi.fn(),
    updateUIClasses: vi.fn(),
    setActionableState: vi.fn(),
    changeMode: vi.fn(),
    map: { fire: vi.fn() }
  }
  return ctx
}

class FakeFeature {
  id = 'feature-1'
  properties: Record<string, unknown>
  coordinates: unknown

  constructor(geojson: { properties?: Record<string, unknown>, geometry: { coordinates: unknown } }) {
    this.properties = { ...geojson.properties }
    this.coordinates = geojson.geometry.coordinates
  }

  setCoordinates(coords: unknown) {
    this.coordinates = coords
  }

  setProperty(key: string, value: unknown) {
    this.properties[key] = value
  }

  toGeoJSON() {
    return {
      type: 'Feature',
      id: this.id,
      properties: this.properties,
      geometry: { type: 'Polygon', coordinates: this.coordinates }
    }
  }
}

function clickEvent(lng: number, lat: number) {
  return { lngLat: { lng, lat } } as never
}

type AnyMode = {
  onSetup?: (this: unknown, options: unknown) => unknown
  onClick?: (this: unknown, state: unknown, e: unknown) => void
  onMouseMove?: (this: unknown, state: unknown, e: unknown) => void
  onKeyUp?: (this: unknown, state: unknown, e: unknown) => void
  onStop?: (this: unknown, state: unknown) => void
}

function setup(mode: unknown, options: unknown = {}) {
  const ctx = mockModeContext()
  const m = mode as AnyMode
  const state = m.onSetup!.call(ctx, options)
  return { ctx, m, state }
}

describe('drawRectangleMode', () => {
  it('两次点击成形:闭合四角环、fire draw.create、切回 simple_select', () => {
    const { ctx, m, state } = setup(drawRectangleMode)

    m.onClick!.call(ctx, state, clickEvent(0, 0))
    m.onMouseMove!.call(ctx, state, clickEvent(2, 1))
    const feature = ctx.features[0]!
    const ring = (feature.coordinates as Position[][])[0]!
    expect(ring).toEqual([[0, 0], [2, 0], [2, 1], [0, 1], [0, 0]])

    m.onClick!.call(ctx, state, clickEvent(2, 1))
    expect(ctx.map.fire).toHaveBeenCalledWith('draw.create', expect.anything())
    expect(ctx.changeMode).toHaveBeenCalledWith('simple_select', expect.anything())
  })

  it('Esc 取消删除要素;未完成时 onStop 兜底删除', () => {
    const { ctx, m, state } = setup(drawRectangleMode)
    m.onClick!.call(ctx, state, clickEvent(0, 0))
    m.onKeyUp!.call(ctx, state, { key: 'Escape' })
    expect(ctx.deleteFeature).toHaveBeenCalledWith('feature-1', expect.anything())

    const second = setup(drawRectangleMode)
    second.m.onStop!.call(second.ctx, second.state)
    expect(second.ctx.deleteFeature).toHaveBeenCalledWith('feature-1', expect.anything())
  })
})

describe('drawCircleMode', () => {
  it('圆心 + 光标定半径:环点数 steps+1,properties 记录 center/radiusInM', () => {
    const { ctx, m, state } = setup(drawCircleMode, { steps: 32 })

    m.onClick!.call(ctx, state, clickEvent(116, 39))
    // 东移约 0.01 度 ≈ 865 m(纬度 39)
    m.onMouseMove!.call(ctx, state, clickEvent(116.01, 39))

    const feature = ctx.features[0]!
    const ring = (feature.coordinates as Position[][])[0]!
    expect(ring).toHaveLength(33)
    expect(feature.properties.center).toEqual([116, 39])
    expect(feature.properties.radiusInM as number).toBeGreaterThan(800)
    expect(feature.properties.radiusInM as number).toBeLessThan(950)

    m.onClick!.call(ctx, state, clickEvent(116.01, 39))
    expect(ctx.map.fire).toHaveBeenCalledWith('draw.create', expect.anything())
  })
})

describe('drawEllipseMode', () => {
  it('y 半轴按 ratio 派生并记录轴参数', () => {
    const { ctx, m, state } = setup(drawEllipseMode, { ratio: 0.5 })

    m.onClick!.call(ctx, state, clickEvent(116, 39))
    m.onMouseMove!.call(ctx, state, clickEvent(116.01, 39))

    const feature = ctx.features[0]!
    const x = feature.properties.xSemiAxisInM as number
    const y = feature.properties.ySemiAxisInM as number
    expect(x).toBeGreaterThan(0)
    expect(y).toBeCloseTo(x * 0.5, 6)
  })
})

describe('drawSectorMode', () => {
  it('三击成形:圆心顶点在环上,properties 记录半径与方位角', () => {
    const { ctx, m, state } = setup(drawSectorMode)

    m.onClick!.call(ctx, state, clickEvent(116, 39))
    // 第二击定半径与起始方位(正东)
    m.onClick!.call(ctx, state, clickEvent(116.01, 39))
    // 扫到正北方向
    m.onMouseMove!.call(ctx, state, clickEvent(116, 39.01))

    const feature = ctx.features[0]!
    const ring = (feature.coordinates as Position[][])[0]!
    const hasCenter = ring.some(([lng, lat]) =>
      Math.abs(lng! - 116) < 1e-9 && Math.abs(lat! - 39) < 1e-9)
    expect(hasCenter).toBe(true)
    expect(feature.properties.radiusInM as number).toBeGreaterThan(0)
    expect(typeof feature.properties.bearing1).toBe('number')

    m.onClick!.call(ctx, state, clickEvent(116, 39.01))
    expect(ctx.map.fire).toHaveBeenCalledWith('draw.create', expect.anything())
  })
})

describe('movkDrawModes', () => {
  it('聚合四个模式且键名符合 gl-draw 约定', () => {
    expect(Object.keys(movkDrawModes).sort()).toEqual(
      ['draw_circle', 'draw_ellipse', 'draw_rectangle', 'draw_sector']
    )
  })
})
