import { describe, expect, it } from 'vitest'
import { spriteFrame, spriteFrameRect } from '../src/runtime/utils/sprite'

describe('spriteFrameRect', () => {
  const grid = { columns: 4, rows: 2, frameWidth: 32, frameHeight: 48 }

  it('单行按列推进 x,y 恒为 0', () => {
    expect(spriteFrameRect(0, grid)).toEqual({ x: 0, y: 0, w: 32, h: 48 })
    expect(spriteFrameRect(1, grid)).toEqual({ x: 32, y: 0, w: 32, h: 48 })
    expect(spriteFrameRect(3, grid)).toEqual({ x: 96, y: 0, w: 32, h: 48 })
  })

  it('行优先:满列后换行,y 递增', () => {
    expect(spriteFrameRect(4, grid)).toEqual({ x: 0, y: 48, w: 32, h: 48 })
    expect(spriteFrameRect(5, grid)).toEqual({ x: 32, y: 48, w: 32, h: 48 })
  })

  it('index 越界按总帧数回绕(含负数)', () => {
    expect(spriteFrameRect(8, grid)).toEqual(spriteFrameRect(0, grid))
    expect(spriteFrameRect(9, grid)).toEqual(spriteFrameRect(1, grid))
    expect(spriteFrameRect(-1, grid)).toEqual(spriteFrameRect(7, grid))
  })

  it('frames 小于 columns*rows 时按 frames 回绕', () => {
    const g = { columns: 4, rows: 2, frameWidth: 10, frameHeight: 10, frames: 6 }
    expect(spriteFrameRect(6, g)).toEqual(spriteFrameRect(0, g))
  })
})

describe('spriteFrame', () => {
  it('无 canvas 2d 环境优雅返回 undefined', () => {
    // happy-dom 无 canvas 2d 实现,验证守卫分支
    expect(spriteFrame({} as CanvasImageSource, { x: 0, y: 0, w: 32, h: 32 }, 64)).toBeUndefined()
  })
})
