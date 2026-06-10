import type { InjectionKey, Ref } from 'vue'

/** MapboxLayerGroup 向子图层下发的组上下文 */
export interface LayerGroupContext {
  /** 组内图层缺省插入锚点（子图层自身 beforeId 优先） */
  beforeId: Ref<string | undefined>
  /** 组级显隐开关 */
  visible: Ref<boolean>
}

export const LayerGroupKey: InjectionKey<LayerGroupContext> = Symbol('movk-mapbox:layer-group')
