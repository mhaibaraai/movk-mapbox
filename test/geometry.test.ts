import { describe, expect, it } from 'vitest'
import type { FeatureCollection } from 'geojson'
import { boundsOfGeoJSON } from '../src/runtime/utils/geometry'

describe('boundsOfGeoJSON', () => {
  it('Point 返回退化包围盒', () => {
    expect(boundsOfGeoJSON({ type: 'Point', coordinates: [116.4, 39.9] }))
      .toEqual([[116.4, 39.9], [116.4, 39.9]])
  })

  it('LineString 取坐标极值', () => {
    const bounds = boundsOfGeoJSON({
      type: 'LineString',
      coordinates: [[116.39, 39.91], [116.48, 39.95], [116.42, 39.88]]
    })
    expect(bounds).toEqual([[116.39, 39.88], [116.48, 39.95]])
  })

  it('Polygon 含内环时扫描全部坐标', () => {
    const bounds = boundsOfGeoJSON({
      type: 'Polygon',
      coordinates: [
        [[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]],
        [[2, 2], [4, 2], [4, 4], [2, 4], [2, 2]]
      ]
    })
    expect(bounds).toEqual([[0, 0], [10, 10]])
  })

  it('Feature 与 FeatureCollection 解包到几何', () => {
    const collection: FeatureCollection = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [-5, 3] } },
        { type: 'Feature', properties: {}, geometry: { type: 'MultiPoint', coordinates: [[7, -2], [1, 8]] } }
      ]
    }
    expect(boundsOfGeoJSON(collection)).toEqual([[-5, -2], [7, 8]])
  })

  it('GeometryCollection 递归子几何', () => {
    const bounds = boundsOfGeoJSON({
      type: 'GeometryCollection',
      geometries: [
        { type: 'Point', coordinates: [100, 0] },
        { type: 'LineString', coordinates: [[101, 1], [102, -1]] }
      ]
    })
    expect(bounds).toEqual([[100, -1], [102, 1]])
  })

  it('空 FeatureCollection 与空几何返回 undefined', () => {
    expect(boundsOfGeoJSON({ type: 'FeatureCollection', features: [] })).toBeUndefined()
    expect(boundsOfGeoJSON({ type: 'MultiPolygon', coordinates: [] })).toBeUndefined()
  })
})
