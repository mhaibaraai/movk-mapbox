export interface DecodedAnimation {
  /** 逐帧 ImageData(均缩放到 size×size) */
  frames: ImageData[]
  /** 每帧时长 ms,与 frames 一一对应 */
  durations: number[]
  /** 纹理边长 */
  size: number
}

const EMPTY: DecodedAnimation = { frames: [], durations: [], size: 0 }

function inferType(url: string): string {
  const ext = url.split('?')[0]!.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'gif': return 'image/gif'
    case 'apng':
    case 'png': return 'image/png'
    case 'webp': return 'image/webp'
    case 'avif': return 'image/avif'
    default: return 'image/png'
  }
}

/**
 * 用浏览器原生 ImageDecoder(WebCodecs)逐帧解码动图(GIF/APNG/WebP/AVIF)为 ImageData。
 * 帧统一缩放到 size×size。无 ImageDecoder/canvas 环境(旧浏览器/SSR/测试)返回空,由组件降级。
 */
export async function decodeAnimatedImage(url: string, size: number): Promise<DecodedAnimation> {
  if (typeof ImageDecoder === 'undefined' || typeof document === 'undefined') return EMPTY
  try {
    const res = await fetch(url)
    const data = await res.arrayBuffer()
    const type = res.headers.get('content-type') || inferType(url)
    const decoder = new ImageDecoder({ data, type })
    await decoder.tracks.ready
    const frameCount = decoder.tracks.selectedTrack?.frameCount ?? 1

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return EMPTY

    const frames: ImageData[] = []
    const durations: number[] = []
    for (let i = 0; i < frameCount; i++) {
      const { image } = await decoder.decode({ frameIndex: i })
      context.clearRect(0, 0, size, size)
      context.drawImage(image, 0, 0, size, size)
      frames.push(context.getImageData(0, 0, size, size))
      // VideoFrame.duration 单位微秒 → ms
      durations.push((image.duration ?? 0) / 1000)
      image.close()
    }
    decoder.close()
    return { frames, durations, size }
  } catch {
    return EMPTY
  }
}
