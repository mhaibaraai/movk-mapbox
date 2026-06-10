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
      const instance = map.value
      let onStyleData: (() => void) | undefined
      if (instance) {
        if (instance.isStyleLoaded()) {
          callback(instance)
        } else {
          // style.load 仅初次/ setStyle 触发；挂载于样式瞬时未就绪时监听 styledata 补跑，
          // 否则该组件永远无法建源建层（注记开关、动态增删图层场景）
          onStyleData = () => {
            if (!instance.isStyleLoaded()) return
            instance.off('styledata', onStyleData!)
            onStyleData = undefined
            if (readyCallbacks.has(callback)) callback(instance)
          }
          instance.on('styledata', onStyleData)
        }
      }
      return () => {
        readyCallbacks.delete(callback)
        if (instance && onStyleData) instance.off('styledata', onStyleData)
      }
    }
  }

  return { context, attach }
}
