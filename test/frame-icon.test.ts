import { describe, expect, it, vi } from 'vitest'
import { createFrameStyleImage, pickFrameIndex } from '../src/runtime/utils/frame-icon'

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

describe('createFrameStyleImage', () => {
  const frame = (size: number, fill = 0) => ({ data: new Uint8ClampedArray(size * size * 4).fill(fill) }) as ImageData

  function setup(options: { size?: number, fps?: () => number, frames: () => ImageData[] }) {
    return createFrameStyleImage({ size: options.size ?? 2, frames: options.frames, fps: options.fps, getMap: () => undefined })
  }

  it('fps getter 在 render 时读取，变化后按新帧率选帧', () => {
    let now = 1000
    vi.spyOn(performance, 'now').mockImplementation(() => now)
    let fps = 1
    const frames = [frame(2, 1), frame(2, 2), frame(2, 3), frame(2, 4)]
    const image = setup({ frames: () => frames, fps: () => fps })

    expect(image.render!()).toBe(true)
    expect(image.data).toBe(frames[0]!.data)
    now = 1500
    // 1fps 下 500ms 仍在第 0 帧
    expect(image.render!()).toBe(false)
    fps = 4
    // 4fps 下 500ms 为第 2 帧
    expect(image.render!()).toBe(true)
    expect(image.data).toBe(frames[2]!.data)
    vi.restoreAllMocks()
  })

  it('frames 换成新数组后即使下标相同也刷新', () => {
    vi.spyOn(performance, 'now').mockImplementation(() => 1000)
    let frames = [frame(2, 1), frame(2, 2)]
    const image = setup({ frames: () => frames })
    expect(image.render!()).toBe(true)
    expect(image.render!()).toBe(false)

    frames = [frame(2, 9), frame(2, 8)]
    expect(image.render!()).toBe(true)
    expect(image.data).toBe(frames[0]!.data)
    vi.restoreAllMocks()
  })

  it('帧数据长度与纹理尺寸不符时视同未就绪，不上传错配数据', () => {
    const image = setup({ size: 4, frames: () => [frame(2)] })
    // 首次仍以透明 data 建立纹理
    expect(image.render!()).toBe(true)
    expect(image.render!()).toBe(false)
    expect(image.data.length).toBe(4 * 4 * 4)
  })
})
