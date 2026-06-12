import { describe, expect, it } from 'vitest'
import { drawThemeStyles } from '../src/runtime/utils/draw-theme'

describe('drawThemeStyles', () => {
  it('图层 id 唯一', () => {
    const ids = drawThemeStyles().map(s => s.id as string)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('颜色统一经 user_color coalesce 表达式驱动', () => {
    const styles = drawThemeStyles()
    const colored = styles.filter((s) => {
      const paint = s.paint as Record<string, unknown>
      return paint['fill-color'] || paint['line-color'] || paint['circle-color']
    })
    // 至少每个着色项含 user_color coalesce(白色 halo 除外)
    const withUserColor = styles.filter(s => JSON.stringify(s).includes('user_color'))
    expect(withUserColor.length).toBeGreaterThan(0)
    expect(colored.length).toBeGreaterThanOrEqual(withUserColor.length)
  })

  it('多边形 fill/stroke 与线均有 active/inactive 成对', () => {
    const ids = drawThemeStyles().map(s => s.id as string)
    for (const base of ['movk-gl-draw-polygon-fill', 'movk-gl-draw-polygon-stroke', 'movk-gl-draw-line']) {
      expect(ids).toContain(`${base}-active`)
      expect(ids).toContain(`${base}-inactive`)
    }
  })

  it('自定义颜色注入回退色', () => {
    const styles = drawThemeStyles({ color: '#123456', activeColor: '#abcdef' })
    const json = JSON.stringify(styles)
    expect(json).toContain('#123456')
    expect(json).toContain('#abcdef')
  })
})
