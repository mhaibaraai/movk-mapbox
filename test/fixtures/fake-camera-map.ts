import type { Map as MaplibreMap } from 'maplibre-gl'

export interface CameraState {
  center: { lng: number, lat: number }
  zoom: number
  bearing: number
  pitch: number
}

/** 相机可读写、jumpTo 同步派发 move 的最小 Map 桩，用于多图联动测试 */
export function fakeCameraMap(initial: Partial<CameraState> = {}) {
  const handlers: Record<string, Set<(e?: unknown) => void>> = {}
  const camera: CameraState = {
    center: { lng: 0, lat: 0 },
    zoom: 1,
    bearing: 0,
    pitch: 0,
    ...initial
  }
  const self = {
    camera,
    jumpToCalls: 0,
    on(type: string, fn: (e?: unknown) => void) {
      (handlers[type] ??= new Set()).add(fn)
    },
    off(type: string, fn: (e?: unknown) => void) {
      handlers[type]?.delete(fn)
    },
    fire(type: string, e?: unknown) {
      for (const fn of [...(handlers[type] ?? [])]) fn(e)
    },
    listenerCount: (type: string) => handlers[type]?.size ?? 0,
    isStyleLoaded: () => true,
    resize() {},
    remove() {},
    getCenter: () => ({ ...camera.center }),
    getZoom: () => camera.zoom,
    getBearing: () => camera.bearing,
    getPitch: () => camera.pitch,
    jumpTo(options: { center?: { lng: number, lat: number }, zoom?: number, bearing?: number, pitch?: number }) {
      self.jumpToCalls++
      if (options.center) camera.center = { ...options.center }
      if (options.zoom !== undefined) camera.zoom = options.zoom
      if (options.bearing !== undefined) camera.bearing = options.bearing
      if (options.pitch !== undefined) camera.pitch = options.pitch
      self.fire('move')
    },
    /** 模拟用户交互改相机并派发 move */
    userMove(next: Partial<CameraState>) {
      Object.assign(camera, next)
      self.fire('move')
    }
  }
  return self
}

export type FakeCameraMap = ReturnType<typeof fakeCameraMap>

export const asMap = (map: FakeCameraMap): MaplibreMap => map as unknown as MaplibreMap
