import { describe, expect, it } from 'vitest'
import { wmtsRasterSource } from '../src/runtime/utils/wmts'
import { wmsRasterSource } from '../src/runtime/utils/wms'
import { tiandituRasterSource } from '../src/runtime/utils/tianditu'

describe('wmtsRasterSource', () => {
  it('构造 GetTile KVP，含 {x}/{y}/{z} 占位符与透传参数', () => {
    const source = wmtsRasterSource({
      url: 'https://example.com/img_w/wmts',
      layer: 'img',
      params: { tk: 'abc' }
    })
    expect(source.type).toBe('raster')
    const url = source.tiles![0]!
    expect(url).toContain('REQUEST=GetTile')
    expect(url).toContain('LAYER=img')
    expect(url).toContain('TILEMATRIXSET=w')
    expect(url).toContain('TILEMATRIX={z}&TILEROW={y}&TILECOL={x}')
    expect(url).toContain('tk=abc')
  })

  it('subdomains + {s} 展开为多条带各自子域名的 tiles', () => {
    const source = wmtsRasterSource({
      url: 'https://t{s}.example.com/vec_w/wmts',
      layer: 'vec',
      subdomains: ['0', '1', '2']
    })
    expect(source.tiles).toHaveLength(3)
    expect(source.tiles![0]).toContain('https://t0.example.com/')
    expect(source.tiles![2]).toContain('https://t2.example.com/')
  })
})

describe('wmsRasterSource', () => {
  it('构造 GetMap，含 BBOX 占位符与尺寸；默认 1.1.1 用 SRS', () => {
    const source = wmsRasterSource({ url: 'https://example.com/wms', layers: 'topp:states' })
    const url = source.tiles![0]!
    expect(url).toContain('REQUEST=GetMap')
    expect(url).toContain('LAYERS=topp:states')
    expect(url).toContain('BBOX={bbox-epsg-3857}')
    expect(url).toContain('WIDTH=256&HEIGHT=256')
    expect(url).toContain('SRS=EPSG:3857')
    expect(url).not.toContain('CRS=')
  })

  it('version 1.3.0 改用 CRS', () => {
    const source = wmsRasterSource({ url: 'https://example.com/wms', layers: 'a', version: '1.3.0' })
    const url = source.tiles![0]!
    expect(url).toContain('VERSION=1.3.0')
    expect(url).toContain('CRS=EPSG:3857')
    expect(url).not.toContain('SRS=')
  })
})

describe('tiandituRasterSource（已迁移 WMTS）', () => {
  it('生成 WMTS GetTile、不再使用 DataServer、携带 tk', () => {
    const source = tiandituRasterSource('img', { tk: 'xyz' })
    expect(source.tiles).toHaveLength(8)
    const url = source.tiles![0]!
    expect(url).toContain('/img_w/wmts')
    expect(url).toContain('REQUEST=GetTile')
    expect(url).not.toContain('DataServer')
    expect(url).toContain('tk=xyz')
  })
})
