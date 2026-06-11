import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h } from 'vue'
import { mount } from '@vue/test-utils'
import type { Map as MapboxMap } from 'mapbox-gl'
import { createMapboxContext } from '../src/runtime/domains/map/context'
import { useMap } from '../src/runtime/composables/useMap'
import type { MapboxContext } from '../src/runtime/types'

// 仅捕获事件处理器的最小 Map 桩
function fakeMap() {
  const handlers: Record<string, (e?: unknown) => void> = {}
  return {
    on: (type: string, fn: (e?: unknown) => void) => { handlers[type] = fn },
    off: () => {},
    isStyleLoaded: () => false,
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
    setStyleLoaded: (value: boolean) => { styleLoaded = value },
    emit: (type: string) => {
      for (const fn of [...(handlers[type] ?? [])]) fn()
    },
    remove: () => {},
    resize: () => {}
  }
}

vi.mock('mapbox-gl', () => {
  class FakeGlMap {
    on() {
      return this
    }

    isStyleLoaded() {
      return false
    }

    remove() {}
    resize() {}
  }
  return {
    default: { Map: FakeGlMap, accessToken: '', prewarm() {}, setRTLTextPlugin() {} }
  }
})

describe('createMapboxContext', () => {
  it('onReady 在 attach 前入队、attach 后由 style.load 触发', () => {
    const { context, attach } = createMapboxContext('m')
    const calls: MapboxMap[] = []
    context.onReady(map => calls.push(map))

    const map = fakeMap()
    attach(map as unknown as MapboxMap)
    expect(calls).toHaveLength(0)

    map.handlers['style.load']!()
    expect(calls).toHaveLength(1)
  })

  it('样式已就绪时 onReady 同步执行', () => {
    const { context, attach } = createMapboxContext('m')
    const map = loadingMap()
    map.setStyleLoaded(true)
    attach(map as unknown as MapboxMap)

    const calls: MapboxMap[] = []
    context.onReady(m => calls.push(m))
    expect(calls).toHaveLength(1)
  })

  it('动态挂载窗口期：依赖源加载完成的 sourcedata 触发补跑', () => {
    const { context, attach } = createMapboxContext('m')
    const map = loadingMap()
    attach(map as unknown as MapboxMap)
    // 样式已加载，进入「已就绪后动态挂载」语境
    map.setStyleLoaded(true)
    map.emit('style.load')

    // 同批新建 geojson 源仍在加载，isStyleLoaded 翻为 false
    map.setStyleLoaded(false)
    const calls: MapboxMap[] = []
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
    const { context, attach } = createMapboxContext('m')
    const map = loadingMap()
    attach(map as unknown as MapboxMap)
    map.setStyleLoaded(false)

    const calls: MapboxMap[] = []
    context.onReady(m => calls.push(m))
    expect(calls).toHaveLength(0)

    map.setStyleLoaded(true)
    map.emit('idle')
    expect(calls).toHaveLength(1)
  })

  it('whenLoaded 在 load 后 resolve，并置 isLoaded', async () => {
    const { context, attach } = createMapboxContext('m')
    const map = fakeMap()
    attach(map as unknown as MapboxMap)

    const promise = context.whenLoaded()
    map.handlers['load']!()

    await expect(promise).resolves.toBe(map)
    expect(context.isLoaded.value).toBe(true)
  })
})

describe('MapboxMap provide 时机', () => {
  it('setup 同步 provide，子组件 useMap() 不抛错且拿到上下文', async () => {
    let captured: MapboxContext | undefined
    const Child = defineComponent({
      setup() {
        captured = useMap()
        return () => h('div')
      }
    })

    const MapboxMap = (await import('../src/runtime/components/Map.vue')).default
    const wrapper = mount(MapboxMap, {
      props: { options: {} },
      slots: { default: () => h(Child) }
    })

    expect(captured).toBeTruthy()
    expect(typeof captured!.whenLoaded).toBe('function')
    wrapper.unmount()
  })
})
