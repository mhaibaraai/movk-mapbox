import { beforeEach, describe, expect, it, vi } from 'vitest'

const gl = vi.hoisted(() => ({
  Map: vi.fn(function (this: { options: unknown }, options: unknown) {
    this.options = options
  }),
  setWorkerCount: vi.fn(),
  prewarm: vi.fn(),
  setRTLTextPlugin: vi.fn(() => Promise.resolve())
}))

vi.mock('maplibre-gl', () => gl)

async function load() {
  vi.resetModules()
  const config = await import('../src/runtime/domains/map/config')
  const { createMaplibreGl } = await import('../src/runtime/domains/map/create-map')
  return { setMaplibreConfig: config.setMaplibreConfig, createMaplibreGl }
}

describe('createMaplibreGl', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    Reflect.deleteProperty(globalThis, Symbol.for('movk-maplibre:config'))
  })

  it('无配置时直接创建实例，不触碰全局设置', async () => {
    const { createMaplibreGl } = await load()
    const map = createMaplibreGl({ container: 'el' } as never) as unknown as { options: unknown }

    expect(map.options).toEqual({ container: 'el' })
    expect(gl.setWorkerCount).not.toHaveBeenCalled()
    expect(gl.prewarm).not.toHaveBeenCalled()
    expect(gl.setRTLTextPlugin).not.toHaveBeenCalled()
  })

  it('按配置应用 workerCount、prewarm 与 RTL 插件，且只应用一次', async () => {
    const { setMaplibreConfig, createMaplibreGl } = await load()
    setMaplibreConfig({ workerCount: 4, prewarm: true, RTLTextPlugin: { pluginURL: 'https://cdn/rtl.js', lazy: true } })

    createMaplibreGl({ container: 'a' } as never)
    createMaplibreGl({ container: 'b' } as never)

    expect(gl.setWorkerCount).toHaveBeenCalledExactlyOnceWith(4)
    expect(gl.prewarm).toHaveBeenCalledOnce()
    expect(gl.setRTLTextPlugin).toHaveBeenCalledExactlyOnceWith('https://cdn/rtl.js', true)
    expect(gl.Map).toHaveBeenCalledTimes(2)
  })

  it('RTLTextPlugin 为 true 时使用默认插件地址', async () => {
    const { setMaplibreConfig, createMaplibreGl } = await load()
    setMaplibreConfig({ RTLTextPlugin: true })

    createMaplibreGl({ container: 'a' } as never)

    expect(gl.setRTLTextPlugin).toHaveBeenCalledExactlyOnceWith(
      'https://cdn.jsdelivr.net/npm/@mapbox/mapbox-gl-rtl-text@0.3.0/dist/mapbox-gl-rtl-text.js',
      false
    )
  })
})
