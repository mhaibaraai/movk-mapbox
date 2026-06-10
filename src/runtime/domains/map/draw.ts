import type { InjectionKey, ShallowRef } from 'vue'
import type MapboxDraw from '@mapbox/mapbox-gl-draw'

/** MapboxDrawControl 向子树下发绘制实例的注入键 */
export const DrawKey: InjectionKey<ShallowRef<MapboxDraw | undefined>> = Symbol('movk-mapbox:draw')
