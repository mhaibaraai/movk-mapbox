import { describe, expect, it } from 'vitest'
import { decodeAnimatedImage } from '../src/runtime/utils/animated-image'

describe('decodeAnimatedImage', () => {
  it('无 ImageDecoder 环境优雅返回空(降级)', async () => {
    // happy-dom 无 WebCodecs ImageDecoder,验证守卫分支
    expect(await decodeAnimatedImage('https://example.com/a.gif', 64)).toEqual({
      frames: [],
      durations: [],
      size: 0
    })
  })
})
