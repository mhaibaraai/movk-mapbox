import { useContextResolver } from '../domains/map/resolve'
import { logger } from '../utils/logger'

export interface UseMapExportOptions {
  /** 目标地图 id;在 MapboxMap 子树外使用时必填 */
  mapId?: string
}

export interface ExportImageOptions {
  /** 图像格式,默认 image/png */
  format?: 'image/png' | 'image/jpeg' | 'image/webp'
  /** 有损格式质量 0-1,默认 0.92 */
  quality?: number
}

export interface DownloadOptions extends ExportImageOptions {
  /** 下载文件名,默认 map.png */
  fileName?: string
}

export interface UseMapExportReturn {
  /** 导出当前地图为 dataURL */
  exportImage: (options?: ExportImageOptions) => Promise<string>
  /** 导出并触发浏览器下载 */
  download: (options?: DownloadOptions) => Promise<void>
}

/**
 * 地图导出:在 render 回调内同步读画布,免 preserveDrawingBuffer 改造。
 * WebGL 缓冲区在帧渲染后即被清空,故必须在 render 事件回调内取 toDataURL。
 */
export function useMapExport(options: UseMapExportOptions = {}): UseMapExportReturn {
  const resolve = useContextResolver(options.mapId)

  async function exportImage(opts: ExportImageOptions = {}): Promise<string> {
    const ctx = resolve()
    if (!ctx) {
      throw new Error('[movk-mapbox] useMapExport: no map context found; pass options.mapId or call inside <MapboxMap>.')
    }
    const map = await ctx.whenLoaded()
    return new Promise<string>((resolve, reject) => {
      map.once('render', () => {
        try {
          resolve(map.getCanvas().toDataURL(opts.format ?? 'image/png', opts.quality ?? 0.92))
        } catch (error) {
          reject(error instanceof Error ? error : new Error(String(error)))
        }
      })
      // 主动触发一帧,保证 render 回调及时执行
      map.triggerRepaint()
    })
  }

  async function download(opts: DownloadOptions = {}): Promise<void> {
    try {
      const dataUrl = await exportImage(opts)
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = opts.fileName ?? 'map.png'
      link.click()
    } catch (error) {
      logger.warn('Map export failed:', error)
      throw error
    }
  }

  return { exportImage, download }
}
