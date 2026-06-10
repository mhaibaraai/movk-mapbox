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
