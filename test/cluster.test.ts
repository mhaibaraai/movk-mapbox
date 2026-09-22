import { afterEach, describe, expect, it } from 'vitest'
import { clusterLayerSpecs } from '../src/runtime/utils/cluster'
import { setMaplibreConfig } from '../src/runtime/domains/map/config'

describe('clusterLayerSpecs', () => {
  afterEach(() => setMaplibreConfig({ textFont: undefined }))

  it('计数层字体跟随全局 textFont 配置，未配置时交由样式默认', () => {
    expect(clusterLayerSpecs({ id: 'p', sourceId: 's' }).count.layout).not.toHaveProperty('text-font')

    setMaplibreConfig({ textFont: ['Noto Sans Regular'] })
    expect(clusterLayerSpecs({ id: 'p', sourceId: 's' }).count.layout).toMatchObject({ 'text-font': ['Noto Sans Regular'] })
  })

  it('生成 clusters/count/points 三层并绑定同一 source', () => {
    const specs = clusterLayerSpecs({ id: 'poi', sourceId: 'poi-source' })
    expect(specs.clusters.id).toBe('poi-clusters')
    expect(specs.count.id).toBe('poi-count')
    expect(specs.points.id).toBe('poi-points')
    for (const spec of [specs.clusters, specs.count, specs.points]) {
      expect(spec.source).toBe('poi-source')
    }
  })

  it('聚合层与计数层过滤聚合点,散点层取反', () => {
    const specs = clusterLayerSpecs({ id: 'p', sourceId: 's' })
    expect(specs.clusters.filter).toEqual(['has', 'point_count'])
    expect(specs.count.filter).toEqual(['has', 'point_count'])
    expect(specs.points.filter).toEqual(['!', ['has', 'point_count']])
  })

  it('默认聚合圆按数量分级,计数层显示缩写数量', () => {
    const specs = clusterLayerSpecs({ id: 'p', sourceId: 's' })
    expect(specs.clusters.type).toBe('circle')
    expect(JSON.stringify(specs.clusters.paint)).toContain('"step"')
    expect(specs.count.type).toBe('symbol')
    expect(JSON.stringify(specs.count.layout)).toContain('point_count_abbreviated')
    expect(specs.points.type).toBe('circle')
  })

  it('支持覆盖各层 paint/layout', () => {
    const specs = clusterLayerSpecs({
      id: 'p',
      sourceId: 's',
      clusterPaint: { 'circle-color': '#000' },
      countLayout: { 'text-size': 16 },
      pointPaint: { 'circle-radius': 10 }
    })
    expect((specs.clusters.paint as Record<string, unknown>)['circle-color']).toBe('#000')
    expect((specs.count.layout as Record<string, unknown>)['text-size']).toBe(16)
    expect((specs.points.paint as Record<string, unknown>)['circle-radius']).toBe(10)
  })
})
