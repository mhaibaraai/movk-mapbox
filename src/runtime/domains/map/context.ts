import { ref, shallowRef } from 'vue'
import type { InjectionKey } from 'vue'
import type { Map as MapboxMap } from 'mapbox-gl'
import type { MapboxContext } from '../../types'

/** MapboxMap 向子组件下发上下文的注入键 */
export const MapboxContextKey: InjectionKey<MapboxContext> = Symbol('movk-mapbox:context')

/**
 * 创建上下文骨架（map 初始为 undefined），供 setup 阶段同步 provide。
 * 实例就绪后由返回的 attach 挂载，避免把 provide 推迟到 onMounted。
 */
export function createMapboxContext(id: string): { context: MapboxContext, attach: (map: MapboxMap) => void } {
  const map = shallowRef<MapboxMap>()
  const isLoaded = ref(false)
  const readyCallbacks = new Set<(map: MapboxMap) => void>()

  let resolveLoaded!: (value: MapboxMap) => void
  const loadedPromise = new Promise<MapboxMap>((resolve) => {
    resolveLoaded = resolve
  })

  function attach(instance: MapboxMap): void {
    map.value = instance
    instance.on('load', () => {
      isLoaded.value = true
      resolveLoaded(instance)
    })
    // style.load 在初次加载与每次 setStyle 后触发：重跑就绪回调以便重建 source/layer
    instance.on('style.load', () => {
      for (const callback of readyCallbacks) callback(instance)
    })
  }

  const context: MapboxContext = {
    id,
    map,
    isLoaded,
    whenLoaded: () => loadedPromise,
    onReady(callback) {
      readyCallbacks.add(callback)
      const unregister = () => readyCallbacks.delete(callback)
      const instance = map.value
      if (!instance) {
        return unregister
      }
      if (instance.isStyleLoaded()) {
        callback(instance)
        return unregister
      }
      // 样式或其依赖源仍在加载窗口期：监听多类 data 事件，待 isStyleLoaded 为真后补跑一次。
      // sourcedata 覆盖「同批新建 geojson 源加载完成」（仅触发 sourcedata 而非 styledata）的场景，
      // idle 为静态地图兜底；否则注记开关、动态增删图层时该回调永远无法建源建层。
      const events = ['styledata', 'sourcedata', 'idle'] as const
      const onData = (): void => {
        if (!instance.isStyleLoaded()) return
        for (const e of events) instance.off(e, onData)
        if (readyCallbacks.has(callback)) callback(instance)
      }
      for (const e of events) instance.on(e, onData)
      return () => {
        unregister()
        for (const e of events) instance.off(e, onData)
      }
    }
  }

  return { context, attach }
}
