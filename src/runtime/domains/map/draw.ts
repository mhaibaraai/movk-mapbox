import type { InjectionKey } from 'vue'
import type { MapboxDrawContext } from '../../types'

/** MapboxDrawControl 向子树下发绘制上下文的注入键 */
export const DrawKey: InjectionKey<MapboxDrawContext> = Symbol('movk-mapbox:draw')
