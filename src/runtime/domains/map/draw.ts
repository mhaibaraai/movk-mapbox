import type { InjectionKey } from 'vue'
import type { MaplibreDrawContext } from '../../types'

/** MaplibreDrawControl 向子树下发绘制上下文的注入键 */
export const DrawKey: InjectionKey<MaplibreDrawContext> = Symbol('movk-maplibre:draw')
