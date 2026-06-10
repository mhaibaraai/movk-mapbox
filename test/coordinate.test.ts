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
})
