import { describe, expect, it } from 'vitest'
import { collectAttributions, isPointRevealed, positionFromPointer, swipeClipPath } from '../src/runtime/utils/swipe'

const rect = { left: 100, top: 50, width: 400, height: 200 }

describe('swipeClipPath', () => {
  it('vertical 裁掉分隔条左侧', () => {
    expect(swipeClipPath(0.25, 'vertical')).toBe('inset(0 0 0 25%)')
  })

  it('horizontal 裁掉分隔条上侧', () => {
    expect(swipeClipPath(0.5, 'horizontal')).toBe('inset(50% 0 0 0)')
  })

  it('越界比例被钳制到 0..1', () => {
    expect(swipeClipPath(-1, 'vertical')).toBe('inset(0 0 0 0%)')
    expect(swipeClipPath(2, 'horizontal')).toBe('inset(100% 0 0 0)')
  })
})

describe('positionFromPointer', () => {
  it('vertical 取横坐标在容器内的比例', () => {
    expect(positionFromPointer(rect, { x: 200, y: 999 }, 'vertical')).toBe(0.25)
  })

  it('horizontal 取纵坐标在容器内的比例', () => {
    expect(positionFromPointer(rect, { x: 999, y: 150 }, 'horizontal')).toBe(0.5)
  })

  it('指针移出容器时钳制到边界', () => {
    expect(positionFromPointer(rect, { x: 0, y: 0 }, 'vertical')).toBe(0)
    expect(positionFromPointer(rect, { x: 900, y: 0 }, 'vertical')).toBe(1)
  })

  it('容器尺寸为 0 时返回 0，避免 NaN', () => {
    expect(positionFromPointer({ left: 0, top: 0, width: 0, height: 0 }, { x: 5, y: 5 }, 'vertical')).toBe(0)
  })
})

describe('isPointRevealed', () => {
  const size = { width: 200, height: 100 }

  it('vertical 判断点是否在分隔条右侧', () => {
    expect(isPointRevealed({ x: 150, y: 10 }, size, 0.5, 'vertical')).toBe(true)
    expect(isPointRevealed({ x: 50, y: 10 }, size, 0.5, 'vertical')).toBe(false)
  })

  it('horizontal 判断点是否在分隔条下侧', () => {
    expect(isPointRevealed({ x: 10, y: 80 }, size, 0.5, 'horizontal')).toBe(true)
    expect(isPointRevealed({ x: 10, y: 20 }, size, 0.5, 'horizontal')).toBe(false)
  })

  it('分隔条上的点视为露出，越界比例被钳制', () => {
    expect(isPointRevealed({ x: 100, y: 0 }, size, 0.5, 'vertical')).toBe(true)
    expect(isPointRevealed({ x: 0, y: 0 }, size, -1, 'vertical')).toBe(true)
    expect(isPointRevealed({ x: 199, y: 0 }, size, 2, 'vertical')).toBe(false)
  })
})

describe('collectAttributions', () => {
  function fakeMap(sources: Record<string, string | undefined>) {
    return {
      getStyle: () => ({ sources: Object.fromEntries(Object.keys(sources).map(id => [id, {}])) }),
      getSource: (id: string) => ({ attribution: sources[id] })
    }
  }

  it('按来源顺序去重合并', () => {
    const map = fakeMap({ a: '© 天地图', b: '© OSM', c: '© 天地图' })
    expect(collectAttributions(map)).toEqual(['© 天地图', '© OSM'])
  })

  it('忽略缺失与空白的署名', () => {
    expect(collectAttributions(fakeMap({ a: undefined, b: '  ' }))).toEqual([])
  })

  it('样式未就绪时返回空数组', () => {
    expect(collectAttributions({ getStyle: () => undefined, getSource: () => undefined })).toEqual([])
  })
})
