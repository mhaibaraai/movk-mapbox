import { describe, expect, it } from 'vitest'
import { transformGeoJSON, transformPoint } from '../src/runtime/utils/coordinate'

describe('transformPoint', () => {
  const beijing: [number, number] = [116.397, 39.908]

  it('WGS84 → GCJ02 偏移在合理范围内', () => {
    const [lng, lat] = transformPoint(beijing, 'WGS84', 'GCJ02')
    expect(lng).not.toBe(beijing[0])
    expect(Math.abs(lng - beijing[0])).toBeLessThan(0.02)
    expect(Math.abs(lat - beijing[1])).toBeLessThan(0.02)
  })

  it('WGS84 → GCJ02 → WGS84 往返近似还原', () => {
    const gcj = transformPoint(beijing, 'WGS84', 'GCJ02')
    const back = transformPoint(gcj, 'GCJ02', 'WGS84')
    expect(back[0]).toBeCloseTo(beijing[0], 4)
    expect(back[1]).toBeCloseTo(beijing[1], 4)
  })

  it('precision 限制输出坐标小数位数', () => {
    const [lng, lat] = transformPoint(beijing, 'WGS84', 'GCJ02', { precision: 3 })
    expect(lng).toBe(Number(lng.toFixed(3)))
    expect(lat).toBe(Number(lat.toFixed(3)))
  })
})

describe('transformGeoJSON', () => {
  it('转换 Feature 且不修改入参', () => {
    const feature = {
      type: 'Feature' as const,
      properties: {},
      geometry: { type: 'Point' as const, coordinates: [116.397, 39.908] }
    }
    const out = transformGeoJSON(feature, 'WGS84', 'GCJ02')
    expect(out.geometry.coordinates[0]).not.toBe(116.397)
    expect(feature.geometry.coordinates[0]).toBe(116.397)
  })

  it('转换嵌套坐标的 FeatureCollection 且不修改入参', () => {
    const raw = {
      type: 'FeatureCollection' as const,
      features: [{
        type: 'Feature' as const,
        properties: {},
        geometry: {
          type: 'LineString' as const,
          coordinates: [[121.4737, 31.2304], [121.48, 31.233]]
        }
      }]
    }
    const out = transformGeoJSON(raw, 'GCJ02', 'WGS84')
    expect(out.features[0].geometry.coordinates[0][0]).not.toBe(121.4737)
    expect(raw.features[0].geometry.coordinates[0][0]).toBe(121.4737)
  })

  it('precision 对所有嵌套坐标取整', () => {
    const raw = {
      type: 'LineString' as const,
      coordinates: [[121.4737, 31.2304], [121.48, 31.233]]
    }
    const out = transformGeoJSON(raw, 'GCJ02', 'WGS84', { precision: 5 })
    for (const [lng, lat] of out.coordinates) {
      expect(lng).toBe(Number(lng.toFixed(5)))
      expect(lat).toBe(Number(lat.toFixed(5)))
    }
  })
})
