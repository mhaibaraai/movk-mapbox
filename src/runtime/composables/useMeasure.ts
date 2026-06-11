import { onUnmounted, ref } from 'vue'
import type { Ref } from 'vue'
import { length } from '@turf/length'
import { area } from '@turf/area'
import type { Feature, FeatureCollection, LineString, Polygon } from 'geojson'
import type { GeoJSONSource, Map as MapboxMap, MapMouseEvent } from 'mapbox-gl'
import { useContextResolver } from '../domains/map/resolve'
import { formatArea, formatDistance } from '../utils/measure'
import { logger } from '../utils/logger'

export type MeasureMode = 'distance' | 'area'

export interface UseMeasureOptions {
  /** 目标地图 id；在 MapboxMap 子树外使用时必填 */
  mapId?: string
  /** 主色，默认 #f59e0b */
  color?: string
}

export interface UseMeasureReturn {
  /** 进入测量：click 加点、mousemove 预览、dblclick 结束当前段 */
  start: (mode: MeasureMode) => void
  /** 退出测量交互（保留已绘结果） */
  stop: () => void
  /** 清空全部测量结果 */
  clear: () => void
  mode: Ref<MeasureMode | undefined>
  active: Ref<boolean>
  /** 当前段（含光标预览）的格式化读数 */
  result: Ref<string>
}

const SOURCE_ID = 'movk-measure'

type Position2D = [number, number]

/** 测距/测面工具：自管 geojson 源与展示图层，turf 计算实时读数。 */
export function useMeasure(options: UseMeasureOptions = {}): UseMeasureReturn {
  const color = options.color ?? '#f59e0b'
  const resolve = useContextResolver(options.mapId)

  const mode = ref<MeasureMode>()
  const active = ref(false)
  const result = ref('')

  // 已完成的要素（线/面 + 标签点）与当前段顶点
  let finished: Feature[] = []
  let vertices: Position2D[] = []
  let cursor: Position2D | undefined
  let boundMap: MapboxMap | undefined
  let stopReady: (() => void) | undefined

  // remove() 后 getCanvas() 返回 undefined：地图已销毁，getSource/getLayer 都会抛
  function isAlive(map: MapboxMap): boolean {
    return Boolean(map.getCanvas())
  }

  function setCursor(map: MapboxMap, value: string): void {
    // 地图移除后 getCanvas() 返回 undefined，卸载期游标重置可安全跳过
    const canvas = map.getCanvas()
    if (canvas) canvas.style.cursor = value
  }

  function ensureLayers(map: MapboxMap): void {
    if (!map.getSource(SOURCE_ID)) {
      map.addSource(SOURCE_ID, { type: 'geojson', data: collection() })
    }
    const layers = [
      { id: `${SOURCE_ID}-fill`, type: 'fill', filter: ['==', ['geometry-type'], 'Polygon'], paint: { 'fill-color': color, 'fill-opacity': 0.15 } },
      { id: `${SOURCE_ID}-line`, type: 'line', filter: ['!=', ['geometry-type'], 'Point'], paint: { 'line-color': color, 'line-width': 2, 'line-dasharray': [2, 1] } },
      { id: `${SOURCE_ID}-points`, type: 'circle', filter: ['==', ['geometry-type'], 'Point'], paint: { 'circle-radius': 4, 'circle-color': '#fff', 'circle-stroke-color': color, 'circle-stroke-width': 2 } },
      { id: `${SOURCE_ID}-labels`, type: 'symbol', filter: ['has', 'label'], layout: { 'text-field': ['get', 'label'], 'text-size': 13, 'text-offset': [0, -1.2], 'text-anchor': 'bottom' }, paint: { 'text-color': color, 'text-halo-color': '#fff', 'text-halo-width': 1.5 } }
    ]
    for (const layer of layers) {
      if (!map.getLayer(layer.id)) map.addLayer({ source: SOURCE_ID, ...layer } as never)
    }
  }

  function currentFeature(): Feature<LineString> | Feature<Polygon> | undefined {
    const coords = cursor ? [...vertices, cursor] : [...vertices]
    if (mode.value === 'area') {
      if (coords.length < 3) return undefined
      return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...coords, coords[0]!]] } }
    }
    if (coords.length < 2) return undefined
    return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } }
  }

  function measureOf(feature: Feature<LineString> | Feature<Polygon>): string {
    return feature.geometry.type === 'Polygon'
      ? formatArea(area(feature))
      : formatDistance(length(feature as Feature<LineString>, { units: 'kilometers' }) * 1000)
  }

  function collection(): FeatureCollection {
    const features: Feature[] = [...finished]
    const current = currentFeature()
    if (current) features.push(current)
    for (const vertex of vertices) {
      features.push({ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: vertex } })
    }
    return { type: 'FeatureCollection', features }
  }

  function refresh(): void {
    const map = boundMap
    if (!map || !isAlive(map)) return
    const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined
    source?.setData(collection())
    const current = currentFeature()
    result.value = current ? measureOf(current) : ''
  }

  function onClick(event: MapMouseEvent): void {
    vertices = [...vertices, [event.lngLat.lng, event.lngLat.lat]]
    refresh()
  }

  function onMove(event: MapMouseEvent): void {
    if (!vertices.length) return
    cursor = [event.lngLat.lng, event.lngLat.lat]
    refresh()
  }

  function finishSegment(): void {
    cursor = undefined
    const current = currentFeature()
    if (current) {
      const label = measureOf(current)
      const anchor = vertices[vertices.length - 1]!
      finished = [
        ...finished,
        current,
        { type: 'Feature', properties: { label }, geometry: { type: 'Point', coordinates: anchor } }
      ]
    }
    vertices = []
    refresh()
  }

  function onDblClick(event: MapMouseEvent): void {
    // dblclick 前已触发两次 click，去掉重复顶点
    event.preventDefault()
    vertices = vertices.slice(0, -1)
    finishSegment()
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape') return
    vertices = []
    cursor = undefined
    refresh()
  }

  function start(nextMode: MeasureMode): void {
    const ctx = resolve()
    if (!ctx) {
      logger.warn('useMeasure: no map context found; pass options.mapId or call inside <MapboxMap>.')
      return
    }
    if (active.value) stop()
    mode.value = nextMode
    active.value = true

    // 样式重载后重建源与图层并恢复已绘内容
    stopReady = ctx.onReady((map) => {
      boundMap = map
      ensureLayers(map)
      refresh()
    })
    void ctx.whenLoaded().then((map) => {
      if (!active.value) return
      map.doubleClickZoom.disable()
      setCursor(map, 'crosshair')
      map.on('click', onClick)
      map.on('mousemove', onMove)
      map.on('dblclick', onDblClick)
      window.addEventListener('keydown', onKeydown)
    })
  }

  function stop(): void {
    if (!active.value) return
    active.value = false
    vertices = []
    cursor = undefined
    stopReady?.()
    stopReady = undefined
    const map = boundMap
    if (map) {
      map.off('click', onClick)
      map.off('mousemove', onMove)
      map.off('dblclick', onDblClick)
      map.doubleClickZoom.enable()
      setCursor(map, '')
      refresh()
    }
    window.removeEventListener('keydown', onKeydown)
    result.value = ''
  }

  function clear(): void {
    finished = []
    vertices = []
    cursor = undefined
    refresh()
  }

  function teardown(): void {
    stop()
    const map = boundMap
    // 地图已被销毁（如子组件先卸载）：source/layer 已由 mapbox 清理，再访问必抛
    if (!map || !isAlive(map)) {
      boundMap = undefined
      return
    }
    for (const suffix of ['-fill', '-line', '-points', '-labels']) {
      const layerId = `${SOURCE_ID}${suffix}`
      if (map.getLayer(layerId)) map.removeLayer(layerId)
    }
    // 样式重载窗口期 removeSource 必抛，吞掉交由新样式重置
    try {
      if (map.getSource(SOURCE_ID)) map.removeSource(SOURCE_ID)
    } catch {
      // style is not done loading
    }
    boundMap = undefined
  }

  onUnmounted(teardown)

  return { start, stop, clear, mode, active, result }
}
