import { describe, expect, it } from 'vitest'
import { effectScope, nextTick, ref, shallowRef } from 'vue'
import { createMaplibreContext } from '../src/runtime/domains/map/context'
import { registerMap, unregisterMap } from '../src/runtime/domains/map/registry'
import { useMapSync } from '../src/runtime/composables/useMapSync'
import type { MaplibreContext } from '../src/runtime/types'
import { asMap, fakeCameraMap } from './fixtures/fake-camera-map'

function attached(id: string, initial?: Parameters<typeof fakeCameraMap>[0]) {
  const { context, attach } = createMaplibreContext(id)
  const map = fakeCameraMap(initial)
  attach(asMap(map))
  return { context, map }
}

function run<T>(fn: () => T) {
  const scope = effectScope()
  const result = scope.run(fn)!
  return { scope, result }
}

describe('useMapSync', () => {
  it('绑定时把其余地图对齐到首图相机', async () => {
    const a = attached('a', { center: { lng: 10, lat: 20 }, zoom: 5 })
    const b = attached('b')
    run(() => useMapSync([a.context, b.context]))
    await nextTick()
    expect(b.map.camera.center).toEqual({ lng: 10, lat: 20 })
    expect(b.map.camera.zoom).toBe(5)
  })

  it('任一地图移动时同步到其余地图，且不回环', async () => {
    const a = attached('a')
    const b = attached('b')
    const c = attached('c')
    run(() => useMapSync([a.context, b.context, c.context]))
    await nextTick()
    const baselineA = a.map.jumpToCalls
    const baselineB = b.map.jumpToCalls

    b.map.userMove({ center: { lng: 1, lat: 2 }, zoom: 3, bearing: 30, pitch: 40 })

    for (const other of [a.map, c.map]) {
      expect(other.camera).toEqual({ center: { lng: 1, lat: 2 }, zoom: 3, bearing: 30, pitch: 40 })
    }
    // 每张其余地图只被下发一次：jumpTo 派发的 move 不再反向同步
    expect(a.map.jumpToCalls - baselineA).toBe(1)
    expect(b.map.jumpToCalls - baselineB).toBe(0)
  })

  it('支持以 map id 引用，地图晚于调用注册也能生效', async () => {
    run(() => useMapSync(['sync-x', 'sync-y']))
    const x = attached('sync-x')
    const y = attached('sync-y')
    registerMap(x.context)
    registerMap(y.context)
    await nextTick()

    x.map.userMove({ zoom: 8 })
    expect(y.map.camera.zoom).toBe(8)
    unregisterMap('sync-x')
    unregisterMap('sync-y')
  })

  it('实例尚未 attach 时等待，attach 后开始同步', async () => {
    const pending = createMaplibreContext('p')
    const b = attached('b')
    run(() => useMapSync([pending.context, b.context]))
    await nextTick()
    expect(b.map.listenerCount('move')).toBe(0)

    const map = fakeCameraMap({ zoom: 6 })
    pending.attach(asMap(map))
    await nextTick()
    expect(b.map.camera.zoom).toBe(6)
    map.userMove({ zoom: 7 })
    expect(b.map.camera.zoom).toBe(7)
  })

  it('enabled 为 false 时解绑，恢复后重新对齐并同步', async () => {
    const a = attached('a')
    const b = attached('b')
    const enabled = ref(true)
    run(() => useMapSync([a.context, b.context], { enabled }))
    await nextTick()

    enabled.value = false
    await nextTick()
    a.map.userMove({ zoom: 9 })
    expect(b.map.camera.zoom).toBe(1)
    expect(a.map.listenerCount('move')).toBe(0)

    enabled.value = true
    await nextTick()
    expect(b.map.camera.zoom).toBe(9)
  })

  it('地图列表变化时重新绑定', async () => {
    const a = attached('a')
    const b = attached('b')
    const c = attached('c')
    const list = shallowRef<MaplibreContext[]>([a.context, b.context])
    run(() => useMapSync(list))
    await nextTick()

    list.value = [a.context, c.context]
    await nextTick()
    expect(b.map.listenerCount('move')).toBe(0)
    a.map.userMove({ zoom: 4 })
    expect(c.map.camera.zoom).toBe(4)
    expect(b.map.camera.zoom).toBe(1)
  })

  it('作用域销毁时解绑全部监听', async () => {
    const a = attached('a')
    const b = attached('b')
    const { scope } = run(() => useMapSync([a.context, b.context]))
    await nextTick()
    scope.stop()
    expect(a.map.listenerCount('move')).toBe(0)
    expect(b.map.listenerCount('move')).toBe(0)
  })
})
