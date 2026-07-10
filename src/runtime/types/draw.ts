import type { Ref } from 'vue'
import type MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

/**
 * 由 MapboxDrawControl 下发的绘制上下文。
 * 子树内经 useMapboxDraw() 注入，子树外经 useMapboxDraw({ mapId }) 查注册表。
 * 写操作等待实例就绪后执行，并同步控件的 v-model:features / v-model:mode。
 */
export interface MapboxDrawContext {
  /** 所属地图 id */
  mapId: string
  /** 绘制实例引用；控件挂载且地图 load 后才有值 */
  draw: Readonly<Ref<MapboxDraw | undefined>>
  /** 实例就绪时 resolve；跨树调用且该 mapId 未注册控件时 reject */
  whenReady: () => Promise<MapboxDraw>
  /** 切换绘制模式 */
  changeMode: (mode: string) => Promise<void>
  /** 添加要素，返回要素 id 列表 */
  add: (geojson: Feature | FeatureCollection | Geometry) => Promise<string[]>
  /** 清空全部要素 */
  deleteAll: () => Promise<void>
  /** 设置要素的 user_* 属性（driver theme 样式） */
  setFeatureProperty: (featureId: string, property: string, value: unknown) => Promise<void>
  /** 当前全部要素集合；未就绪时为 undefined */
  getAll: () => FeatureCollection | undefined
  /** 当前绘制模式；未就绪时为 undefined */
  getMode: () => string | undefined
}
