import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import type { Map as MaplibreMap } from 'maplibre-gl'
import { createMaplibreContext } from '../src/runtime/domains/map/context'
import { useMap } from '../src/runtime/composables/useMap'
import type { MaplibreContext } from '../src/runtime/types'

// 仅捕获事件处理器的最小 Map 桩
function fakeMap() {
  const handlers: Record<string, (e?: unknown) => void> = {}
  return {
    on: (type: string, fn: (e?: unknown) => void) => { handlers[type] = fn },
    off: () => {},
    isStyleLoaded: () => false,
    getLayersOrder: () => [] as string[],
    remove: () => {},
    resize: () => {},
    handlers
  }
}

// 支持同一事件多监听器、isStyleLoaded 可切换的 Map 桩，复刻动态挂载窗口期
function loadingMap() {
  const handlers: Record<string, Set<(e?: unknown) => void>> = {}
  let styleLoaded = false
  return {
    on: (type: string, fn: (e?: unknown) => void) => {
      (handlers[type] ??= new Set()).add(fn)
    },
    off: (type: string, fn: (e?: unknown) => void) => {
      handlers[type]?.delete(fn)
    },
    isStyleLoaded: () => styleLoaded,
    getLayersOrder: () => [] as string[],
    setStyleLoaded: (value: boolean) => { styleLoaded = value },
    emit: (type: string) => {
      for (const fn of [...(handlers[type] ?? [])]) fn()
    },
    remove: () => {},
    resize: () => {}
  }
}

vi.mock('maplibre-gl', () => {
  class FakeGlMap {
    on() {
      return this
    }

    getLayersOrder() {
      return [] as string[]
    }

    isStyleLoaded() {
      return false
    }

    remove() {}
    resize() {}
  }
  return {
    Map: FakeGlMap
  }
})

describe('createMaplibreContext', () => {
  it('onReady 在 attach 前入队、attach 后由 style.load 触发', () => {
    const { context, attach } = createMaplibreContext('m')
    const calls: MaplibreMap[] = []
    context.onReady(map => calls.push(map))

    const map = fakeMap()
    attach(map as unknown as MaplibreMap)
    expect(calls).toHaveLength(0)

    map.handlers['style.load']!()
    expect(calls).toHaveLength(1)
  })

  it('style.load 时先快照样式自带图层，再执行就绪回调', () => {
    const { context, attach } = createMaplibreContext('m')
    const order = ['background', 'roads']
    const map = { ...fakeMap(), getLayersOrder: () => [...order] }
    // 就绪回调模拟组件建层：快照不应包含运行时图层
    context.onReady(() => order.push('runtime-layer'))
    attach(map as unknown as MaplibreMap)

    map.handlers['style.load']!()
    expect(context.styleLayerIds.value).toEqual(['background', 'roads'])
    expect(order).toContain('runtime-layer')
  })

  it('样式已就绪时 onReady 同步执行', () => {
    const { context, attach } = createMaplibreContext('m')
    const map = loadingMap()
    map.setStyleLoaded(true)
    attach(map as unknown as MaplibreMap)

    const calls: MaplibreMap[] = []
    context.onReady(m => calls.push(m))
    expect(calls).toHaveLength(1)
  })

  it('动态挂载窗口期：依赖源加载完成的 sourcedata 触发补跑', () => {
    const { context, attach } = createMaplibreContext('m')
    const map = loadingMap()
    attach(map as unknown as MaplibreMap)
    // 样式已加载，进入「已就绪后动态挂载」语境
    map.setStyleLoaded(true)
    map.emit('style.load')

    // 同批新建 geojson 源仍在加载，isStyleLoaded 翻为 false
    map.setStyleLoaded(false)
    const calls: MaplibreMap[] = []
    context.onReady(m => calls.push(m))
    expect(calls).toHaveLength(0)

    // 源加载中先抖动一次 sourcedata，仍未就绪不应补跑
    map.emit('sourcedata')
    expect(calls).toHaveLength(0)

    // 源加载完成：isStyleLoaded 转真，sourcedata 补跑一次
    map.setStyleLoaded(true)
    map.emit('sourcedata')
    expect(calls).toHaveLength(1)

    // 后续事件不应重复触发
    map.emit('sourcedata')
    map.emit('idle')
    expect(calls).toHaveLength(1)
  })

  it('动态挂载窗口期：idle 作为静态地图兜底信号补跑', () => {
    const { context, attach } = createMaplibreContext('m')
    const map = loadingMap()
    attach(map as unknown as MaplibreMap)
    map.setStyleLoaded(false)

    const calls: MaplibreMap[] = []
    context.onReady(m => calls.push(m))
    expect(calls).toHaveLength(0)

    map.setStyleLoaded(true)
    map.emit('idle')
    expect(calls).toHaveLength(1)
  })

  it('whenLoaded 在 load 后 resolve，并置 isLoaded', async () => {
    const { context, attach } = createMaplibreContext('m')
    const map = fakeMap()
    attach(map as unknown as MaplibreMap)

    const promise = context.whenLoaded()
    map.handlers['load']!()

    await expect(promise).resolves.toBe(map)
    expect(context.isLoaded.value).toBe(true)
  })

  it('whenAttached 在 attach 后即 resolve，不等 load', async () => {
    const { context, attach } = createMaplibreContext('m')
    const map = fakeMap()
    const promise = context.whenAttached()
    attach(map as unknown as MaplibreMap)

    await expect(promise).resolves.toBe(map)
    expect(context.isLoaded.value).toBe(false)
  })
})

describe('MaplibreMap provide 时机', () => {
  it('setup 同步 provide，子组件 useMap() 不抛错且拿到上下文', async () => {
    let captured: MaplibreContext | undefined
    const Child = defineComponent({
      setup() {
        captured = useMap()
        return () => h('div')
      }
    })

    const MaplibreMap = (await import('../src/runtime/components/Map.vue')).default
    const wrapper = mount(MaplibreMap, {
      props: { options: {} },
      slots: { default: () => h(Child) }
    })

    expect(captured).toBeTruthy()
    expect(typeof captured!.whenLoaded).toBe('function')
    wrapper.unmount()
  })
})
