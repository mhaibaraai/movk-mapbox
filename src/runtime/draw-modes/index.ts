import {
  TerraDrawCircleMode,
  TerraDrawEllipseMode,
  TerraDrawLineStringMode,
  TerraDrawPointMode,
  TerraDrawPolygonMode,
  TerraDrawRectangleMode,
  TerraDrawSectorMode,
  TerraDrawSelectMode
} from 'terra-draw'
import type { TerraDrawExtend } from 'terra-draw'
import { drawThemeStyles } from '../utils/draw-theme'
import type { DrawThemeOptions } from '../utils/draw-theme'

/** 内置绘制模式名（不含选择模式 'select'） */
export const DRAW_MODE_NAMES = ['point', 'linestring', 'polygon', 'rectangle', 'circle', 'ellipse', 'sector'] as const

export type DrawModeName = (typeof DRAW_MODE_NAMES)[number]

/** terra-draw 模式实例（绘制或选择模式） */
export type DrawMode = TerraDrawExtend.TerraDrawBaseDrawMode<TerraDrawExtend.CustomStyling>

export interface MovkDrawModesOptions {
  /** 绘制主题，参见 drawThemeStyles */
  theme?: DrawThemeOptions
}

// 点线面可编辑顶点；规则图形仅整体拖拽，编辑顶点会破坏几何约束
const EDITABLE_COORDINATES = { draggable: true, deletable: true, midpoints: true }

/**
 * 预设 terra-draw 模式集合：选择模式 + 全部内置绘制模式，统一应用主题。
 * 每次调用返回新实例，模式实例不可在多个 TerraDraw 间共享。
 */
export function movkDrawModes(options: MovkDrawModesOptions = {}): DrawMode[] {
  const styles = drawThemeStyles(options.theme)
  const flags = Object.fromEntries(DRAW_MODE_NAMES.map(name => [name, {
    feature: {
      draggable: true,
      ...(name === 'linestring' || name === 'polygon' ? { coordinates: EDITABLE_COORDINATES } : {})
    }
  }]))

  return [
    new TerraDrawSelectMode({ flags, styles: styles.select }),
    new TerraDrawPointMode({ styles: styles.point }),
    new TerraDrawLineStringMode({ styles: styles.linestring }),
    new TerraDrawPolygonMode({ styles: styles.polygon }),
    new TerraDrawRectangleMode({ styles: styles.rectangle }),
    new TerraDrawCircleMode({ styles: styles.circle }),
    new TerraDrawEllipseMode({ styles: styles.ellipse }),
    new TerraDrawSectorMode({ styles: styles.sector })
  ] as unknown as DrawMode[]
}
