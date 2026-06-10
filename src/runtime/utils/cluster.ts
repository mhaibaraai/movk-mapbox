import type { CircleLayerSpecification, SymbolLayerSpecification } from 'mapbox-gl'

type PropBag = Record<string, unknown>

export interface ClusterLayersOptions {
  /** 图层 id 前缀，生成 {id}-clusters / {id}-count / {id}-points */
  id: string
  /** 聚合 geojson 数据源 id */
  sourceId: string
  /** 覆盖聚合圆 paint */
  clusterPaint?: PropBag
  /** 覆盖计数文字 layout */
  countLayout?: PropBag
  /** 覆盖计数文字 paint */
  countPaint?: PropBag
  /** 覆盖散点 paint */
  pointPaint?: PropBag
}

export interface ClusterLayerSpecs {
  clusters: CircleLayerSpecification
  count: SymbolLayerSpecification
  points: CircleLayerSpecification
}

/** 生成聚合三层（分级聚合圆 / 数量标注 / 未聚合散点）图层规格。 */
export function clusterLayerSpecs(options: ClusterLayersOptions): ClusterLayerSpecs {
  const { id, sourceId } = options

  const clusters: CircleLayerSpecification = {
    id: `${id}-clusters`,
    type: 'circle',
    source: sourceId,
    filter: ['has', 'point_count'],
    paint: (options.clusterPaint ?? {
      // 按聚合数量分级配色与半径：<100 / <750 / >=750
      'circle-color': ['step', ['get', 'point_count'], '#51bbd6', 100, '#f1f075', 750, '#f28cb1'],
      'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
    }) as CircleLayerSpecification['paint']
  }

  const count: SymbolLayerSpecification = {
    id: `${id}-count`,
    type: 'symbol',
    source: sourceId,
    filter: ['has', 'point_count'],
    layout: (options.countLayout ?? {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-size': 12
    }) as SymbolLayerSpecification['layout'],
    paint: (options.countPaint ?? {
      'text-color': '#fff'
    }) as SymbolLayerSpecification['paint']
  }

  const points: CircleLayerSpecification = {
    id: `${id}-points`,
    type: 'circle',
    source: sourceId,
    filter: ['!', ['has', 'point_count']],
    paint: (options.pointPaint ?? {
      'circle-color': '#11b4da',
      'circle-radius': 6,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff'
    }) as CircleLayerSpecification['paint']
  }

  return { clusters, count, points }
}
