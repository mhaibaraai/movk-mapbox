<script setup lang="ts">
import { computed, useId } from 'vue'
import type { GeoJSONFeature, GeoJSONSource, GeoJSONSourceSpecification, MapEventOf } from 'mapbox-gl'
import type { Point } from 'geojson'
import { clusterLayerSpecs } from '../../utils/cluster'
import { useMap } from '../../composables/useMap'
import MapboxSource from '../Source.vue'
import MapboxLayer from '../Layer.vue'

type PropBag = Record<string, unknown>

const props = withDefaults(defineProps<{
  /** 点要素数据（GeoJSON 或其 URL） */
  data: GeoJSONSourceSpecification['data']
  /** source 与图层 id 前缀；省略时自动生成 */
  sourceId?: string
  /** 聚合半径（像素），默认 50 */
  clusterRadius?: number
  /** 超过该缩放级别不再聚合，默认 14 */
  clusterMaxZoom?: number
  /** 覆盖聚合圆 paint */
  clusterPaint?: PropBag
  /** 覆盖计数文字 layout */
  countLayout?: PropBag
  /** 覆盖计数文字 paint */
  countPaint?: PropBag
  /** 覆盖散点 paint */
  pointPaint?: PropBag
  /** 点击聚合圆自动放大到展开级别，默认 true */
  autoExpand?: boolean
  /** 插入到该图层之前 */
  beforeId?: string
}>(), {
  clusterRadius: 50,
  clusterMaxZoom: 14,
  autoExpand: true
})

const emit = defineEmits<{
  clusterClick: [payload: { clusterId: number, coordinates: [number, number], expansionZoom: number }]
  pointClick: [feature: GeoJSONFeature]
}>()

const ctx = useMap()
const id = props.sourceId ?? `movk-cluster-${useId()}`

const source = computed<GeoJSONSourceSpecification>(() => ({
  type: 'geojson',
  data: props.data,
  cluster: true,
  clusterRadius: props.clusterRadius,
  clusterMaxZoom: props.clusterMaxZoom
}))

const specs = computed(() => clusterLayerSpecs({
  id,
  sourceId: id,
  clusterPaint: props.clusterPaint,
  countLayout: props.countLayout,
  countPaint: props.countPaint,
  pointPaint: props.pointPaint
}))

type LayerClickEvent = MapEventOf<'click'> & { features?: GeoJSONFeature[] }

function onClusterClick(event: MapEventOf<'click'>): void {
  const map = ctx.map.value
  const feature = (event as LayerClickEvent).features?.[0]
  const clusterId = feature?.properties?.cluster_id as number | undefined
  if (!map || !feature || clusterId === undefined) return

  const coordinates = (feature.geometry as Point).coordinates as [number, number]
  const geojsonSource = map.getSource(id) as GeoJSONSource
  geojsonSource.getClusterExpansionZoom(clusterId, (error, expansionZoom) => {
    if (error || expansionZoom == null) return
    if (props.autoExpand) map.easeTo({ center: coordinates, zoom: expansionZoom })
    emit('clusterClick', { clusterId, coordinates, expansionZoom })
  })
}

function onPointClick(event: MapEventOf<'click'>): void {
  const feature = (event as LayerClickEvent).features?.[0]
  if (feature) emit('pointClick', feature)
}
</script>

<template>
  <MapboxSource :source-id="id" :source="source">
    <MapboxLayer
      :layer-id="specs.clusters.id"
      type="circle"
      :source="id"
      :filter="specs.clusters.filter"
      :paint="specs.clusters.paint"
      :before-id="beforeId"
      @click="onClusterClick"
    />
    <MapboxLayer
      :layer-id="specs.count.id"
      type="symbol"
      :source="id"
      :filter="specs.count.filter"
      :layout="specs.count.layout"
      :paint="specs.count.paint"
      :before-id="beforeId"
    />
    <MapboxLayer
      :layer-id="specs.points.id"
      type="circle"
      :source="id"
      :filter="specs.points.filter"
      :paint="specs.points.paint"
      :before-id="beforeId"
      @click="onPointClick"
    />
  </MapboxSource>
</template>
