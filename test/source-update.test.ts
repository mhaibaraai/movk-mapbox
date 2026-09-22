import { describe, expect, it, vi } from 'vitest'
import type { Source } from 'maplibre-gl'
import type { SourceSpecification } from '@maplibre/maplibre-gl-style-spec'
import { updateSource } from '../src/runtime/utils/source'
import { logger } from '../src/runtime/utils/logger'

function createSourceStub() {
  return {
    setData: vi.fn(),
    setUrl: vi.fn(),
    setTiles: vi.fn(),
    updateImage: vi.fn(),
    setCoordinates: vi.fn(),
    setClusterOptions: vi.fn(() => Promise.resolve())
  }
}

const emptyCollection = { type: 'FeatureCollection', features: [] } as const

function update(stub: ReturnType<typeof createSourceStub>, next: SourceSpecification, prev?: SourceSpecification): void {
  updateSource(stub as unknown as Source, next, prev)
}

describe('updateSource', () => {
  it('geojson 数据变化时调用 setData', () => {
    const source = createSourceStub()
    const data = { type: 'Feature', geometry: { type: 'Point', coordinates: [1, 2] }, properties: {} } as const
    update(source, { type: 'geojson', data }, { type: 'geojson', data: emptyCollection })
    expect(source.setData).toHaveBeenCalledWith(data)
    expect(source.setClusterOptions).not.toHaveBeenCalled()
  })

  it('geojson 聚类参数变化时调用 setClusterOptions', () => {
    const source = createSourceStub()
    update(
      source,
      { type: 'geojson', data: emptyCollection, cluster: true, clusterRadius: 80 },
      { type: 'geojson', data: emptyCollection, cluster: true, clusterRadius: 50 }
    )
    expect(source.setClusterOptions).toHaveBeenCalledWith({ cluster: true, clusterRadius: 80 })
  })

  it('raster-dem 瓦片变化时调用 setTiles', () => {
    const source = createSourceStub()
    update(source, { type: 'raster-dem', tiles: ['b/{z}/{x}/{y}.png'] }, { type: 'raster-dem', tiles: ['a/{z}/{x}/{y}.png'] })
    expect(source.setTiles).toHaveBeenCalledWith(['b/{z}/{x}/{y}.png'])
  })

  it('video 坐标变化时调用 setCoordinates', () => {
    const source = createSourceStub()
    const coordinates = [[0, 1], [1, 1], [1, 0], [0, 0]] as [[number, number], [number, number], [number, number], [number, number]]
    update(source, { type: 'video', urls: ['a.mp4'], coordinates })
    expect(source.setCoordinates).toHaveBeenCalledWith(coordinates)
  })

  it('类型变化时告警并跳过，不调用任何 setter', () => {
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => {})
    const source = createSourceStub()
    update(source, { type: 'vector', tiles: ['v/{z}/{x}/{y}.pbf'] }, { type: 'geojson', data: emptyCollection })
    expect(warn).toHaveBeenCalledTimes(1)
    for (const fn of Object.values(source)) expect(fn).not.toHaveBeenCalled()
    warn.mockRestore()
  })
})
