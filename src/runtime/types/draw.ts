import type { Ref } from 'vue'
import type { TerraDraw, TerraDrawExtend } from 'terra-draw'
import type { Feature, FeatureCollection, Geometry } from 'geojson'

type FeatureId = TerraDrawExtend.FeatureId

/**
 * 由 MaplibreDrawControl 下发的绘制上下文。
 * 子树内经 useMaplibreDraw() 注入，子树外经 useMaplibreDraw({ mapId }) 查注册表。
 * 写操作等待实例就绪后执行，并同步控件的 v-model:features / v-model:mode。
 */
export interface MaplibreDrawContext {
  /** 所属地图 id */
  mapId: string
  /** terra-draw 实例引用；控件挂载且地图 load 后才有值 */
  draw: Readonly<Ref<TerraDraw | undefined>>
  /** 实例就绪时 resolve；跨树调用且该 mapId 未注册控件时 reject */
  whenReady: () => Promise<TerraDraw>
  /** 切换绘制模式（如 'select'、'polygon'） */
  changeMode: (mode: string) => Promise<void>
  /** 添加要素；缺失 id 时自动生成，缺失 properties.mode 时按几何类型推断。返回成功添加的要素 id */
  add: (geojson: Feature | FeatureCollection | Geometry) => Promise<FeatureId[]>
  /** 清空全部要素 */
  deleteAll: () => Promise<void>
  /** 设置要素属性（如 color 覆盖主题色） */
  setFeatureProperty: (featureId: FeatureId, property: string, value: unknown) => Promise<void>
  /** 已完成的要素集合（不含绘制中的要素与辅助点）；未就绪时为 undefined */
  getAll: () => FeatureCollection | undefined
  /** 当前绘制模式；未就绪时为 undefined */
  getMode: () => string | undefined
}
