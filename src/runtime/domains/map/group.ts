import { defineComponent, h, provide, shallowRef } from 'vue'
import type { InjectionKey, PropType, ShallowRef } from 'vue'
import type { MaplibreContext } from '../../types'

/** 登记地图上下文，返回注销函数 */
export type MapGroupRegister = (context: MaplibreContext) => () => void

/** 多图容器（如卷帘）向插槽内 MaplibreMap 下发的登记入口 */
export const MapGroupKey: InjectionKey<MapGroupRegister> = Symbol('movk-maplibre:map-group')

/** 为插槽内的 MaplibreMap 提供登记入口的包裹层，class/style 透传到根 div */
export const MapGroupSlot = defineComponent({
  name: 'MapGroupSlot',
  props: {
    register: { type: Function as PropType<MapGroupRegister>, required: true }
  },
  setup(props, { slots }) {
    provide(MapGroupKey, context => props.register(context))
    return () => h('div', slots.default?.())
  }
})

/** 单个插槽位的地图上下文引用与登记函数；注销时只清除自己登记的上下文 */
export function useMapGroupSlot(): { context: ShallowRef<MaplibreContext | undefined>, register: MapGroupRegister } {
  const context = shallowRef<MaplibreContext>()
  return {
    context,
    register(value) {
      context.value = value
      return () => {
        if (context.value === value) context.value = undefined
      }
    }
  }
}
