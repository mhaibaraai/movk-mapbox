import { shallowRef } from 'vue'
import type { GeoJSONStoreFeatures, TerraDraw, TerraDrawExtend } from 'terra-draw'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import type { MaplibreDrawContext } from '../../types'
import { logger } from '../../utils/logger'

type FeatureId = TerraDrawExtend.FeatureId

/** 控件把受控模型的回写通道交给上下文，绘制指令与模型同步因此只有一处实现 */
export interface DrawContextCallbacks {
  /** 要素集合变更后回写 v-model:features */
  onFeatures: (features: Feature[]) => void
  /** 模式变更后回写 v-model:mode */
  onMode: (mode: string) => void
}

// terra-draw 内部的辅助要素标记（选择点、中点、闭合点等），未从包入口导出
const GUIDANCE_KEYS = ['currentlyDrawing', 'edited', 'selectionPoint', 'midPoint', 'closingPoint', 'snappingPoint', 'coordinatePoint']

// 外部数据缺省 mode 时按几何类型归入内置模式，其余几何 terra-draw 不支持
const MODE_BY_GEOMETRY: Partial<Record<Geometry['type'], string>> = {
  Point: 'point',
  LineString: 'linestring',
  Polygon: 'polygon'
}

/** 已完成的要素：排除绘制中的要素与编辑辅助点 */
export function committedFeatures(draw: TerraDraw): GeoJSONStoreFeatures[] {
  return draw.getSnapshot().filter(feature => !GUIDANCE_KEYS.some(key => feature.properties[key]))
}

function toFeatures(geojson: Feature | FeatureCollection | Geometry): Feature[] {
  if (geojson.type === 'FeatureCollection') return geojson.features
  if (geojson.type === 'Feature') return [geojson]
  return [{ type: 'Feature', properties: {}, geometry: geojson }]
}

/** 规范化为 terra-draw store 要素：补 id 与 mode，跳过不支持的几何 */
export function toStoreFeatures(draw: TerraDraw, geojson: Feature | FeatureCollection | Geometry): GeoJSONStoreFeatures[] {
  return toFeatures(geojson).flatMap((feature) => {
    const mode = (feature.properties?.mode as string | undefined) ?? MODE_BY_GEOMETRY[feature.geometry.type]
    if (!mode) {
      logger.warn(`Draw: unsupported geometry type "${feature.geometry.type}" skipped.`)
      return []
    }
    return [{
      ...feature,
      id: feature.id ?? draw.getFeatureId(),
      properties: { ...feature.properties, mode }
    } as GeoJSONStoreFeatures]
  })
}

/** 添加要素并返回通过校验的 id，未通过的逐个告警 */
export function addStoreFeatures(draw: TerraDraw, features: GeoJSONStoreFeatures[]): FeatureId[] {
  if (!features.length) return []
  return draw.addFeatures(features).flatMap((result) => {
    if (result.valid && result.id !== undefined) return [result.id]
    logger.warn(`Draw: feature "${String(result.id)}" rejected: ${result.reason ?? 'invalid'}.`)
    return []
  })
}

/**
 * 创建绘制上下文骨架（draw 初始为 undefined），供 setup 阶段同步 provide 与注册。
 * 实例在控件 onMounted 里创建后由返回的 attach 挂载并 resolve whenReady。
 */
export function createDrawContext(
  mapId: string,
  callbacks: DrawContextCallbacks
): { context: MaplibreDrawContext, attach: (draw: TerraDraw) => void } {
  const draw = shallowRef<TerraDraw>()

  let resolveReady!: (instance: TerraDraw) => void
  const readyPromise = new Promise<TerraDraw>((resolve) => {
    resolveReady = resolve
  })

  function attach(instance: TerraDraw): void {
    draw.value = instance
    resolveReady(instance)
  }

  async function withDraw<T>(action: (instance: TerraDraw) => T): Promise<T> {
    const instance = await readyPromise
    const result = action(instance)
    callbacks.onFeatures(committedFeatures(instance))
    return result
  }

  const context: MaplibreDrawContext = {
    mapId,
    draw,
    whenReady: () => readyPromise,
    changeMode: async (mode) => {
      const instance = await readyPromise
      instance.setMode(mode)
      callbacks.onMode(mode)
    },
    add: geojson => withDraw(instance => addStoreFeatures(instance, toStoreFeatures(instance, geojson))),
    deleteAll: () => withDraw(instance => instance.clear()),
    setFeatureProperty: (featureId, property, value) => withDraw((instance) => {
      instance.updateFeatureProperties(featureId, { [property]: value as never })
    }),
    getAll: () => (draw.value ? { type: 'FeatureCollection', features: committedFeatures(draw.value) } : undefined),
    getMode: () => draw.value?.getMode()
  }

  return { context, attach }
}
