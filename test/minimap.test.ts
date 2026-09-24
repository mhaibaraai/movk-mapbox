import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { minimapZoom, viewportPolygon } from '../src/runtime/utils/minimap'
import { createMinimapControl } from '../src/runtime/domains/map/minimap'
import { fakeCameraMap } from './fixtures/fake-camera-map'

type Handler = (e?: unknown) => void

// 鹰眼子地图桩：记录构造选项、jumpTo/setStyle/setData 调用，project/unproject 取恒等偏移
const minis = vi.hoisted(() => [] as Array<ReturnType<typeof makeMini>>)
function makeMini(options: Record<string, unknown>) {
  const handlers: Record<string, Set<Handler>> = {}
  const sources = new Map<string, { data: unknown[] }>()
  const layers: string[] = []
  const self = {
    options,
    jumpToCalls: [] as unknown[],
    setStyleCalls: [] as unknown[],
    removed: false,
    layers,
    sources,
    center: { lng: 0, lat: 0 },
    on(type: string, fn: Handler) {
      (handlers[type] ??= new Set()).add(fn)
    },
    off(type: string, fn: Handler) {
      handlers[type]?.delete(fn)
    },
    fire(type: string) {
      for (const fn of [...(handlers[type] ?? [])]) fn()
    },
    jumpTo(opts: { center: { lng: number, lat: number } }) {
      self.jumpToCalls.push(opts)
      self.center = opts.center
    },
    setStyle(style: unknown) {
      self.setStyleCalls.push(style)
      sources.clear()
      layers.length = 0
    },
    getCenter: () => self.center,
    project: (p: { lng: number, lat: number }) => ({ x: p.lng, y: p.lat }),
    unproject: (p: [number, number]) => ({ lng: p[0], lat: p[1] }),
    getSource: (id: string) => {
      const source = sources.get(id)
      return source && { setData: (data: unknown) => source.data.push(data) }
    },
    addSource: (id: string) => sources.set(id, { data: [] }),
    addLayer: (spec: { id: string }) => layers.push(spec.id),
    remove() {
      self.removed = true
    }
  }
  return self
}

vi.mock('maplibre-gl', () => ({
  Map: function FakeMini(options: Record<string, unknown>) {
    const mini = makeMini(options)
    minis.push(mini)
    return mini
  }
}))

function parentMap(styleLoaded = true) {
  const map = fakeCameraMap({ center: { lng: 120, lat: 30 }, zoom: 10 })
  return Object.assign(map, {
    isStyleLoaded: () => styleLoaded,
    getStyle: () => ({ version: 8, name: 'parent', sources: {}, layers: [] }),
    getContainer: () => ({ clientWidth: 100, clientHeight: 50 }),
    unproject: (p: [number, number]) => ({ lng: p[0], lat: p[1] }),
    easeToCalls: [] as unknown[],
    easeTo(opts: unknown) {
      this.easeToCalls.push(opts)
    }
  })
}

const baseOptions = { zoomOffset: -4, width: 200, height: 150, color: '#3b82f6' }

beforeEach(() => {
  minis.length = 0
})

describe('minimapZoom', () => {
  it('叠加偏移并不低于 0', () => {
    expect(minimapZoom(10, -4)).toBe(6)
    expect(minimapZoom(2, -4)).toBe(0)
  })
})

describe('viewportPolygon', () => {
  it('以容器四角反投影构成闭合环', () => {
    const feature = viewportPolygon(parentMap() as unknown as MaplibreMap)
    expect(feature.geometry.coordinates[0]).toEqual([[0, 0], [100, 0], [100, 50], [0, 50], [0, 0]])
  })
})

describe('createMinimapControl', () => {
  it('onAdd 返回定尺寸容器，并以非交互方式创建子地图', () => {
    const parent = parentMap()
    const container = createMinimapControl(baseOptions).onAdd(parent as unknown as MaplibreMap)
    expect(container.classList.contains('movk-maplibre-minimap')).toBe(true)
    expect(container.style.width).toBe('200px')
    expect(container.style.height).toBe('150px')
    const [mini] = minis
    expect(mini!.options).toMatchObject({ interactive: false, attributionControl: false, zoom: 6 })
    expect(mini!.options.style).toEqual(parent.getStyle())
  })

  it('指定 style 时使用该样式，且不跟随主图切换样式', () => {
    const parent = parentMap()
    createMinimapControl({ ...baseOptions, style: 'https://example.com/style.json' }).onAdd(parent as unknown as MaplibreMap)
    const [mini] = minis
    expect(mini!.options.style).toBe('https://example.com/style.json')
    parent.fire('style.load')
    expect(mini!.setStyleCalls).toHaveLength(0)
  })

  it('未指定 style 时跟随主图样式切换', () => {
    const parent = parentMap(false)
    createMinimapControl(baseOptions).onAdd(parent as unknown as MaplibreMap)
    const [mini] = minis
    expect(mini!.options.style).toBeUndefined()
    parent.fire('style.load')
    expect(mini!.setStyleCalls).toEqual([parent.getStyle()])
  })

  it('子地图样式就绪后添加视口框，并随主图移动同步相机与视口', () => {
    const parent = parentMap()
    createMinimapControl(baseOptions).onAdd(parent as unknown as MaplibreMap)
    const [mini] = minis
    mini!.fire('style.load')
    expect(mini!.layers).toEqual(['movk-minimap-viewport-fill', 'movk-minimap-viewport-line'])

    parent.userMove({ center: { lng: 1, lat: 2 }, zoom: 8 })
    expect(mini!.jumpToCalls.at(-1)).toEqual({ center: { lng: 1, lat: 2 }, zoom: 4 })
    expect(mini!.sources.get('movk-minimap-viewport')!.data.length).toBeGreaterThan(0)
  })

  it('拖拽鹰眼按像素增量平移主图', () => {
    const parent = parentMap()
    const container = createMinimapControl(baseOptions).onAdd(parent as unknown as MaplibreMap)
    const [mini] = minis
    mini!.center = { lng: 10, lat: 10 }

    container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 50, clientY: 50, pointerId: 1 }))
    container.dispatchEvent(new PointerEvent('pointermove', { clientX: 55, clientY: 47, pointerId: 1 }))
    expect(parent.camera.center).toEqual({ lng: 15, lat: 7 })
    container.dispatchEvent(new PointerEvent('pointerup', { clientX: 55, clientY: 47, pointerId: 1 }))
    expect(parent.easeToCalls).toHaveLength(0)
  })

  it('单击鹰眼把主图中心缓动到点击处', () => {
    const parent = parentMap()
    const container = createMinimapControl(baseOptions).onAdd(parent as unknown as MaplibreMap)
    vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({ left: 10, top: 20 } as DOMRect)

    container.dispatchEvent(new PointerEvent('pointerdown', { clientX: 40, clientY: 60, pointerId: 1 }))
    container.dispatchEvent(new PointerEvent('pointerup', { clientX: 40, clientY: 60, pointerId: 1 }))
    expect(parent.easeToCalls).toEqual([{ center: { lng: 30, lat: 40 } }])
  })

  it('onRemove 解绑主图监听并销毁子地图', () => {
    const parent = parentMap()
    const control = createMinimapControl(baseOptions)
    control.onAdd(parent as unknown as MaplibreMap)
    control.onRemove(parent as unknown as MaplibreMap)
    expect(parent.listenerCount('move')).toBe(0)
    expect(parent.listenerCount('style.load')).toBe(0)
    expect(minis[0]!.removed).toBe(true)
  })
})
