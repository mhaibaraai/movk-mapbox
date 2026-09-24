import type { Map as MaplibreMap } from 'maplibre-gl'

export interface CameraState {
  center: { lng: number, lat: number }
  zoom: number
  bearing: number
  pitch: number
}

interface FiredEvent {
  type: string
  [key: string]: unknown
}

/** 相机可读写、jumpTo 同步派发 move 的最小 Map 桩，用于多图联动与卷帘测试 */
export function fakeCameraMap(initial: Partial<CameraState> = {}, options: Record<string, unknown> = {}) {
  const handlers: Record<string, Set<(e?: unknown) => void>> = {}
  const camera: CameraState = {
    center: { lng: 0, lat: 0 },
    zoom: 1,
    bearing: 0,
    pitch: 0,
    ...initial
  }
  const canvas = { style: { cursor: '' } }
  const self = {
    options,
    camera,
    canvas,
    jumpToCalls: 0,
    resizeCalls: 0,
    removed: false,
    projection: { type: 'mercator' } as { type: string },
    sources: {} as Record<string, { attribution?: string }>,
    /** 以对象形式 fire 的事件，按顺序记录 */
    fired: [] as FiredEvent[],
    on(type: string, fn: (e?: unknown) => void) {
      (handlers[type] ??= new Set()).add(fn)
    },
    off(type: string, fn: (e?: unknown) => void) {
      handlers[type]?.delete(fn)
    },
    /** 兼容 maplibre 的 fire(event) 与测试便捷的 fire(type, payload) */
    fire(typeOrEvent: string | FiredEvent, e?: unknown) {
      const isEvent = typeof typeOrEvent !== 'string'
      const type = isEvent ? typeOrEvent.type : typeOrEvent
      if (isEvent) self.fired.push(typeOrEvent)
      for (const fn of [...(handlers[type] ?? [])]) fn(isEvent ? typeOrEvent : e)
    },
    listenerCount: (type: string) => handlers[type]?.size ?? 0,
    isStyleLoaded: () => true,
    getLayersOrder: () => [] as string[],
    resize() {
      self.resizeCalls++
    },
    remove() {
      self.removed = true
    },
    getCanvas: () => canvas,
    getContainer: () => ({ clientWidth: 200, clientHeight: 100 }),
    getStyle: () => ({ sources: Object.fromEntries(Object.keys(self.sources).map(id => [id, {}])) }),
    getSource: (id: string) => self.sources[id],
    getProjection: () => self.projection,
    setProjection(projection: { type: string }) {
      self.projection = projection
    },
    getCenter: () => ({ ...camera.center }),
    getZoom: () => camera.zoom,
    getBearing: () => camera.bearing,
    getPitch: () => camera.pitch,
    getPadding: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
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
