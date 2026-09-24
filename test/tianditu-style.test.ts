import { afterEach, describe, expect, it } from 'vitest'
import { setMaplibreConfig } from '../src/runtime/domains/map/config'
import { tiandituStyle } from '../src/runtime/utils/tianditu'

afterEach(() => {
  Reflect.deleteProperty(globalThis, Symbol.for('movk-maplibre:config'))
})

describe('tiandituStyle', () => {
  it('组装底图栅格源与图层，默认不含注记', () => {
    const style = tiandituStyle('img', { tk: 'k' })
    expect(style.version).toBe(8)
    expect(Object.keys(style.sources)).toEqual(['tianditu-img'])
    expect(style.layers).toEqual([{ id: 'tianditu-img', type: 'raster', source: 'tianditu-img' }])
    expect(JSON.stringify(style.sources)).toContain('tk=k')
  })

  it('annotation 为 true 时叠加对应注记图层', () => {
    const style = tiandituStyle('vec', { tk: 'k', annotation: true })
    expect(style.layers.map(layer => layer.id)).toEqual(['tianditu-vec', 'tianditu-cva'])
  })

  it('携带运行时配置中的 glyphs，便于叠加文字图层', () => {
    setMaplibreConfig({ glyphs: 'https://example.com/{fontstack}/{range}.pbf', tk: 'k' })
    expect(tiandituStyle('ter').glyphs).toBe('https://example.com/{fontstack}/{range}.pbf')
  })
})
