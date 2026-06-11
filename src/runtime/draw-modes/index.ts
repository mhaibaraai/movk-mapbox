import { drawRectangleMode } from './rectangle'
import { drawCircleMode } from './circle'
import { drawEllipseMode } from './ellipse'
import { drawSectorMode } from './sector'

export { drawRectangleMode } from './rectangle'
export { drawCircleMode } from './circle'
export { drawEllipseMode } from './ellipse'
export { drawSectorMode } from './sector'

/**
 * movk 自定义绘制模式集合,与 MapboxDraw.modes 合并使用:
 * `:options="{ modes: { ...MapboxDraw.modes, ...movkDrawModes } }"`
 */
export const movkDrawModes = {
  draw_rectangle: drawRectangleMode,
  draw_circle: drawCircleMode,
  draw_ellipse: drawEllipseMode,
  draw_sector: drawSectorMode
}
