import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import type { Feature, Polygon } from 'geojson'
import MapboxMap from '../src/runtime/components/Map.vue'
import MapboxBufferCircle from '../src/runtime/components/buffers/BufferCircle.vue'
import MapboxBufferSector from '../src/runtime/components/buffers/BufferSector.vue'
import { bufferPaints } from '../src/runtime/utils/buffer'

const { maps, makeFakeMap } = vi.hoisted(() => {
  const maps: ReturnType<typeof makeFakeMap>[] = []
  function makeFakeMap() {
    const handlers: Record<string, Set<(e?: unknown) => void>> = {}
    const layers = new Set<string>()
    const sources = new Map<string, unknown>()
    const self = {
      layers,
      sources,
      setDataCalls: [] as unknown[],
      on(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        ;(handlers[type] ??= new Set()).add(listener)
      },
      off(type: string, a: unknown, b?: unknown) {
        const listener = (b ?? a) as (e?: unknown) => void
        handlers[type]?.delete(listener)
      },
      fire(type: string, e?: unknown) {
        handlers[type]?.forEach(fn => fn(e))
      },
      isStyleLoaded: () => true,
      getLayer: (id: string) => (layers.has(id) ? { id } : undefined),
      addLayer: (spec: { id: string }) => layers.add(spec.id),
      removeLayer: (id: string) => layers.delete(id),
      getSource: (id: string) => (sources.has(id)
        ? { setData: (data: unknown) => self.setDataCalls.push(data) }
        : undefined),
      addSource: (id: string, spec: unknown) => sources.set(id, spec),
      removeSource: (id: string) => sources.delete(id),
      resize() {},
      remove() {},
      getCenter: () => ({ lng: 0, lat: 0 }),
      getZoom: () => 1,
      getBearing: () => 0,
      getPitch: () => 0,
      setStyle() {}
    }
    maps.push(self)
    return self
  }
  return { maps, makeFakeMap }
})

vi.mock('mapbox-gl', () => {
  function FakeGlMap(this: unknown) {
    return makeFakeMap()
  }
  function Noop() {}
  return {
    default: { Map: FakeGlMap, accessToken: '', prewarm() {}, setRTLTextPlugin() {} },
    LngLat: { convert: (v: unknown) => v },
    Marker: Noop,
    Popup: Noop
  }
})

describe('bufferPaints', () => {
  it('默认主色与覆盖项生效', () => {
    const defaults = bufferPaints()
    expect(defaults.fill['fill-color']).toBe('#3b82f6')
    expect(defaults.line['line-width']).toBe(2)

    const custom = bufferPaints({ color: '#000', fillOpacity: 0.5 })
    expect(custom.fill).toEqual({ 'fill-color': '#000', 'fill-opacity': 0.5 })
    expect(custom.line['line-color']).toBe('#000')
  })
})

describe('BufferCircle', () => {
  it('turf 算出测地圆面并建 fill/line 两层；半径变化经 setData 原地更新', async () => {
    const radius = ref(500)
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxBufferCircle, {
            layerId: 'buf',
            center: [116.39, 39.91],
            radius: radius.value
          })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    expect(map.layers.has('buf-fill')).toBe(true)
    expect(map.layers.has('buf-line')).toBe(true)
    const spec = map.sources.get('buf') as { data: Feature<Polygon> }
    expect(spec.data.geometry.type).toBe('Polygon')
    // steps=64 的圆环：首尾闭合共 65 点
    expect(spec.data.geometry.coordinates[0]).toHaveLength(65)

    radius.value = 1000
    await nextTick()
    expect(map.setDataCalls).toHaveLength(1)
    const updated = map.setDataCalls[0] as Feature<Polygon>
    expect(updated.geometry.type).toBe('Polygon')
  })
})

describe('BufferSector', () => {
  it('扇形几何含圆心顶点', () => {
    const Parent = defineComponent({
      setup() {
        return () => h(MapboxMap, { options: {} }, {
          default: () => h(MapboxBufferSector, {
            layerId: 'sec',
            center: [116.39, 39.91],
            radius: 800,
            bearing1: 0,
            bearing2: 90
          })
        })
      }
    })
    mount(Parent)
    const map = maps[maps.length - 1]!
    map.fire('style.load')

    const spec = map.sources.get('sec') as { data: Feature<Polygon> }
    const ring = spec.data.geometry.coordinates[0]!
    const hasCenter = ring.some(([lng, lat]) =>
      Math.abs(lng! - 116.39) < 1e-9 && Math.abs(lat! - 39.91) < 1e-9)
    expect(hasCenter).toBe(true)
  })
})
