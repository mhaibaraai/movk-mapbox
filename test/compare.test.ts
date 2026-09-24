import { describe, expect, it } from 'vitest'
import { compareClipPath, positionFromPointer } from '../src/runtime/utils/compare'

const rect = { left: 100, top: 50, width: 400, height: 200 }

describe('compareClipPath', () => {
  it('vertical 按横向比例裁掉后图左侧', () => {
    expect(compareClipPath(0.25, 'vertical')).toBe('inset(0 0 0 25%)')
  })

  it('horizontal 按纵向比例裁掉后图上侧', () => {
    expect(compareClipPath(0.5, 'horizontal')).toBe('inset(50% 0 0 0)')
  })

  it('越界比例被钳制到 0..1', () => {
    expect(compareClipPath(-1, 'vertical')).toBe('inset(0 0 0 0%)')
    expect(compareClipPath(2, 'horizontal')).toBe('inset(100% 0 0 0)')
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
