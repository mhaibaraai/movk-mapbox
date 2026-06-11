import { describe, expect, it } from 'vitest'
import { pickFrameIndex } from '../src/runtime/utils/frame-icon'

describe('pickFrameIndex', () => {
  it('无 durations 时按 fps 推进并回绕', () => {
    // 12fps:每帧约 83.3ms
    expect(pickFrameIndex(0, undefined, 12, 4)).toBe(0)
    expect(pickFrameIndex(100, undefined, 12, 4)).toBe(1)
    expect(pickFrameIndex(250, undefined, 12, 4)).toBe(3)
    // 第 4 帧回绕到 0
    expect(pickFrameIndex(1000 / 3, undefined, 12, 4)).toBe(0)
  })

  it('有 durations 时按累积时长选帧', () => {
    const durations = [100, 200, 300] // cycle = 600
    expect(pickFrameIndex(0, durations, 12, 3)).toBe(0)
    expect(pickFrameIndex(50, durations, 12, 3)).toBe(0)
    expect(pickFrameIndex(150, durations, 12, 3)).toBe(1)
    expect(pickFrameIndex(350, durations, 12, 3)).toBe(2)
  })

  it('durations 超过周期时循环回绕', () => {
    const durations = [100, 200, 300]
    expect(pickFrameIndex(600, durations, 12, 3)).toBe(0)
    expect(pickFrameIndex(750, durations, 12, 3)).toBe(1)
  })

  it('durations 长度与 total 不匹配时回退 fps', () => {
    expect(pickFrameIndex(100, [100, 200], 12, 4)).toBe(1)
  })

  it('total 为 0 返回 0,cycle 为 0 返回 0', () => {
    expect(pickFrameIndex(100, undefined, 12, 0)).toBe(0)
    expect(pickFrameIndex(100, [0, 0], 12, 2)).toBe(0)
  })
})
