import { omitUndefined } from '@movk/core'
import type { GeoJSONSource, ImageSource, RasterTileSource, Source, VectorTileSource, VideoSource } from 'maplibre-gl'
import type { GeoJSONSourceSpecification, SourceSpecification } from '@maplibre/maplibre-gl-style-spec'
import { logger } from './logger'

const CLUSTER_KEYS = ['cluster', 'clusterRadius', 'clusterMaxZoom'] as const

function clusterChanged(next: GeoJSONSourceSpecification, prev?: SourceSpecification): boolean {
  if (!prev || prev === next) return false
  const previous = prev as GeoJSONSourceSpecification
  return CLUSTER_KEYS.some(key => next[key] !== previous[key])
}

/**
 * 按类型把 source 定义的变化增量应用到已有源，避免整源重建。
 * prev 与 next 为同一引用（原地修改）时仅按 next 下发数据；类型变化无法原地更新，告警后跳过。
 */
export function updateSource(source: Source, next: SourceSpecification, prev?: SourceSpecification): void {
  if (prev && prev.type !== next.type) {
    logger.warn(`Source type changed from "${prev.type}" to "${next.type}"; recreate it with a new :key instead.`)
    return
  }

  if (next.type === 'geojson') {
    const geojson = source as GeoJSONSource
    if (next.data) geojson.setData(next.data)
    if (clusterChanged(next, prev)) {
      geojson.setClusterOptions(omitUndefined({
        cluster: next.cluster,
        clusterRadius: next.clusterRadius,
        clusterMaxZoom: next.clusterMaxZoom
      })).catch(error => logger.error('Failed to update cluster options:', error))
    }
  } else if (next.type === 'vector') {
    if (next.url) (source as VectorTileSource).setUrl(next.url)
    if (next.tiles) (source as VectorTileSource).setTiles(next.tiles)
  } else if (next.type === 'raster' || next.type === 'raster-dem') {
    if (next.url) (source as RasterTileSource).setUrl(next.url)
    if (next.tiles) (source as RasterTileSource).setTiles(next.tiles)
  } else if (next.type === 'image' && next.url) {
    (source as ImageSource).updateImage(next as typeof next & { url: string })
  } else if (next.type === 'video' && next.coordinates) {
    (source as VideoSource).setCoordinates(next.coordinates)
  }
}
