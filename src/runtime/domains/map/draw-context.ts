import { shallowRef } from 'vue'
import type MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { Feature } from 'geojson'
import type { MapboxDrawContext } from '../../types'

/** 控件把受控模型的回写通道交给上下文，绘制指令与模型同步因此只有一处实现 */
export interface DrawContextCallbacks {
  /** 要素集合变更后回写 v-model:features */
  onFeatures: (features: Feature[]) => void
  /** 模式变更后回写 v-model:mode */
  onMode: (mode: string) => void
}

/**
 * 创建绘制上下文骨架（draw 初始为 undefined），供 setup 阶段同步 provide 与注册。
 * 实例在控件 onMounted 里创建后由返回的 attach 挂载并 resolve whenReady。
 */
export function createDrawContext(
  mapId: string,
  callbacks: DrawContextCallbacks
): { context: MapboxDrawContext, attach: (draw: MapboxDraw) => void } {
  const draw = shallowRef<MapboxDraw>()

  let resolveReady!: (instance: MapboxDraw) => void
  const readyPromise = new Promise<MapboxDraw>((resolve) => {
    resolveReady = resolve
  })

  function attach(instance: MapboxDraw): void {
    draw.value = instance
    resolveReady(instance)
  }

  function syncFeatures(instance: MapboxDraw): void {
    callbacks.onFeatures(instance.getAll().features)
  }

  async function withDraw(action: (instance: MapboxDraw) => void): Promise<void> {
    const instance = await readyPromise
    action(instance)
    syncFeatures(instance)
  }

  const context: MapboxDrawContext = {
    mapId,
    draw,
    whenReady: () => readyPromise,
    changeMode: mode => withDraw((instance) => {
      instance.changeMode(mode as never)
      callbacks.onMode(mode)
    }),
    async add(geojson) {
      const instance = await readyPromise
      const ids = instance.add(geojson)
      syncFeatures(instance)
      return ids
    },
    deleteAll: () => withDraw(instance => instance.deleteAll()),
    setFeatureProperty: (featureId, property, value) => withDraw((instance) => {
      instance.setFeatureProperty(featureId, property, value)
      // setFeatureProperty 仅标脏不重绘，re-add 同一要素触发 store.render() 且保留选中态
      const feature = instance.get(featureId)
      if (feature) instance.add(feature)
    }),
    getAll: () => draw.value?.getAll(),
    getMode: () => draw.value?.getMode()
  }

  return { context, attach }
}
