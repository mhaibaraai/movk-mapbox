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
import type { DrawMode, DrawModeEntry, DrawModeName, DrawThemeOptions } from '../../types'
import { logger } from '../../utils/logger'
import { drawThemeStyles } from './draw-theme'
import type { DrawThemeStyles } from './draw-theme'

/** 全部内置模式名，即控件缺省的模式集合 */
export const DRAW_MODE_NAMES: readonly DrawModeName[] = ['select', 'point', 'linestring', 'polygon', 'rectangle', 'circle', 'ellipse', 'sector']

// 点线面可编辑顶点；规则图形与自定义模式仅整体拖拽，编辑顶点会破坏几何约束
const EDITABLE_MODES = new Set(['linestring', 'polygon'])
const EDITABLE_COORDINATES = { draggable: true, deletable: true, midpoints: true }

function selectFlags(names: string[]) {
  return Object.fromEntries(names.filter(name => name !== 'select').map(name => [name, {
    feature: { draggable: true, ...(EDITABLE_MODES.has(name) ? { coordinates: EDITABLE_COORDINATES } : {}) }
  }]))
}

function createMode(name: DrawModeName, styles: DrawThemeStyles, names: string[]): unknown {
  switch (name) {
    case 'select': return new TerraDrawSelectMode({ flags: selectFlags(names), styles: styles.select })
    case 'point': return new TerraDrawPointMode({ styles: styles.point })
    case 'linestring': return new TerraDrawLineStringMode({ styles: styles.linestring })
    case 'polygon': return new TerraDrawPolygonMode({ styles: styles.polygon })
    case 'rectangle': return new TerraDrawRectangleMode({ styles: styles.rectangle })
    case 'circle': return new TerraDrawCircleMode({ styles: styles.circle })
    case 'ellipse': return new TerraDrawEllipseMode({ styles: styles.ellipse })
    case 'sector': return new TerraDrawSectorMode({ styles: styles.sector })
  }
}

export function isDrawModeName(entry: DrawModeEntry): entry is DrawModeName {
  return typeof entry === 'string' && DRAW_MODE_NAMES.includes(entry)
}

/**
 * 解析模式项为 terra-draw 实例：模式名按主题构造内置模式，实例原样透传。
 * 每次调用返回新实例，模式实例不可在多个 TerraDraw 间共享。
 */
export function resolveDrawModes(entries: readonly DrawModeEntry[], theme?: DrawThemeOptions): DrawMode[] {
  const valid = entries.filter((entry) => {
    if (typeof entry !== 'string' || isDrawModeName(entry)) return true
    logger.warn(`Draw: unknown mode "${entry}" skipped.`)
    return false
  })
  const styles = drawThemeStyles(theme)
  const names = valid.map(entry => (typeof entry === 'string' ? entry : entry.mode))
  return valid.map(entry => (typeof entry === 'string' ? createMode(entry, styles, names) : entry)) as DrawMode[]
}
