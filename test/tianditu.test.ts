import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTianditu } from '../src/runtime/utils/tianditu-client'
import { administrative } from '../src/runtime/utils/tianditu-administrative'
import { geocode, reverseGeocode } from '../src/runtime/utils/tianditu-geocoder'
import { TiandituError } from '../src/runtime/utils/tianditu-request'
import { route } from '../src/runtime/utils/tianditu-route'
import { locate, search, searchNearby } from '../src/runtime/utils/tianditu-search'

const TK = 'test-key'

function mockJson(data: unknown): void {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => data })))
}

function mockJsonSequence(...datas: unknown[]): void {
  let call = 0
  vi.stubGlobal('fetch', vi.fn(async () => {
    const data = datas[Math.min(call, datas.length - 1)]
    call += 1
    return { ok: true, json: async () => data }
  }))
}

function mockText(text: string): void {
  vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, text: async () => text })))
}

function fetchMock(): { mock: { calls: [URL][] } } {
  return fetch as unknown as { mock: { calls: [URL][] } }
}

function lastUrl(): URL {
  const calls = fetchMock().mock.calls
  return new URL(calls[0]![0].toString())
}

function urlAt(index: number): URL {
  return new URL(fetchMock().mock.calls[index]![0].toString())
}

function callCount(): number {
  return fetchMock().mock.calls.length
}

function lastPostStr(): Record<string, unknown> {
  return JSON.parse(lastUrl().searchParams.get('postStr')!)
}

function postStrAt(index: number): Record<string, unknown> {
  return JSON.parse(urlAt(index).searchParams.get('postStr')!)
}

const rawPoint: [number, number] = [116.404, 39.915]

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('search', () => {
  it('resultType=1 归一化 POI，坐标保持 WGS84 透传（不做二次转换）', async () => {
    mockJson({
      resultType: 1,
      count: 1,
      pois: [{ name: '天安门', address: '北京', lonlat: `${rawPoint[0]},${rawPoint[1]}`, poiType: 101 }]
    })
    const result = await search({ type: 'nearby', keyword: '天安门', center: [116.4, 39.9], radius: 3000 }, TK)

    expect(result.kind).toBe('poi')
    if (result.kind !== 'poi') throw new Error('unreachable')
    expect(result.count).toBe(1)
    expect(result.pois[0]!.name).toBe('天安门')
    expect(result.pois[0]!.location[0]).toBeCloseTo(rawPoint[0], 4)
    expect(result.pois[0]!.location[1]).toBeCloseTo(rawPoint[1], 4)
  })

  it('nearby 组装 queryType=3 与 pointLonlat', async () => {
    mockJson({ resultType: 1, count: 0, pois: [] })
    await search({ type: 'nearby', keyword: '公园', center: [116.4, 39.9], radius: 5000 }, TK)

    const post = lastPostStr()
    expect(post.queryType).toBe(3)
    expect(post.queryRadius).toBe(5000)
    expect(typeof post.pointLonlat).toBe('string')
    expect(lastUrl().searchParams.get('tk')).toBe(TK)
  })

  it('resultType=2 归一化统计', async () => {
    mockJson({
      resultType: 2,
      statistics: { count: 42, adminCount: 3, priorityCitys: [{ name: '上海市', count: 10, adminCode: '156310000', lonlat: `${rawPoint[0]},${rawPoint[1]}` }] }
    })
    const result = await search({ type: 'statistics', specify: '156310000', keyword: '学校' }, TK)

    expect(result.kind).toBe('statistics')
    if (result.kind !== 'statistics') throw new Error('unreachable')
    expect(result.statistics.count).toBe(42)
    expect(result.statistics.priorityCities[0]!.location[0]).toBeCloseTo(rawPoint[0], 4)
  })

  it('resultType=3 归一化行政区', async () => {
    mockJson({
      resultType: 3,
      area: { name: '北京市', adminCode: 110000, level: 10, lonlat: `${rawPoint[0]},${rawPoint[1]}`, bound: '116.0,39.8,116.7,40.0' }
    })
    const result = await search({ type: 'normal', keyword: '北京', bounds: [73, 3, 135, 53], level: 10 }, TK)

    expect(result.kind).toBe('area')
    if (result.kind !== 'area') throw new Error('unreachable')
    expect(result.area.adminCode).toBe('110000')
    expect(result.area.bound).toHaveLength(4)
  })

  it('无数据（infocode 3001）返回 empty', async () => {
    mockJson({ status: { infocode: 3001, cndesc: 'No data found' } })
    const result = await search({ type: 'district', specify: '156110108', keyword: '商厦' }, TK)
    expect(result.kind).toBe('empty')
  })

  it('真错误（infocode 2003）抛 TiandituError', async () => {
    mockJson({ status: { infocode: 2003, cndesc: 'Parameter missing' } })
    await expect(search({ type: 'district', specify: '', keyword: 'x' }, TK)).rejects.toBeInstanceOf(TiandituError)
  })

  it('resultType=1 伴随 type=4 prompt 时提取 suggestedDistrict', async () => {
    mockJson({
      resultType: 1,
      count: 13293,
      pois: [{ name: '沃尔玛购物广场上海南浦大桥店', lonlat: `${rawPoint[0]},${rawPoint[1]}` }],
      prompt: [{ type: 4, admins: [{ adminName: '上海市', adminCode: 156310000 }] }]
    })
    const result = await search({ type: 'normal', keyword: '上海南浦大桥', bounds: [73, 3, 135, 53], level: 10 }, TK)

    expect(result.kind).toBe('poi')
    if (result.kind !== 'poi') throw new Error('unreachable')
    expect(result.suggestedDistrict).toEqual({ name: '上海市', code: '156310000' })
  })

  it('category 单个 dataTypes 走扁平响应，归一化为 poi', async () => {
    mockJson({ resultType: 1, count: 5, pois: [{ name: '中国银行', lonlat: `${rawPoint[0]},${rawPoint[1]}` }] })
    const result = await search({ type: 'category', specify: '156310000', bounds: [121.47, 31.22, 121.52, 31.25], dataTypes: '金融' }, TK)

    expect(lastPostStr().queryType).toBe(13)
    expect(result.kind).toBe('poi')
    if (result.kind !== 'poi') throw new Error('unreachable')
    expect(result.pois[0]!.name).toBe('中国银行')
  })

  it('category 多个 dataTypes 按分类名分组，归一化为 categories，坐标 WGS84 透传', async () => {
    mockJson({
      金融: { resultType: 1, count: 123, pois: [{ name: '中国银行', lonlat: `${rawPoint[0]},${rawPoint[1]}` }] },
      餐饮: { resultType: 1, count: 456, pois: [{ name: '海底捞', lonlat: '121.5,31.24' }, { name: '西贝', lonlat: '121.51,31.25' }] }
    })
    const result = await search({ type: 'category', specify: '156310000', bounds: [121.47, 31.22, 121.52, 31.25], dataTypes: '金融,餐饮' }, TK)

    expect(result.kind).toBe('categories')
    if (result.kind !== 'categories') throw new Error('unreachable')
    expect(result.categories).toHaveLength(2)
    const finance = result.categories.find(c => c.name === '金融')!
    expect(finance.count).toBe(123)
    expect(finance.pois[0]!.name).toBe('中国银行')
    expect(finance.pois[0]!.location[0]).toBeCloseTo(rawPoint[0], 4)
    expect(finance.pois[0]!.location[1]).toBeCloseTo(rawPoint[1], 4)
    const food = result.categories.find(c => c.name === '餐饮')!
    expect(food.count).toBe(456)
    expect(food.pois).toHaveLength(2)
  })

  it('category 多分类中某类无数据，得到 count:0/pois:[]，不影响其他分类', async () => {
    mockJson({
      金融: { resultType: 1, count: 12, pois: [{ name: '工商银行', lonlat: `${rawPoint[0]},${rawPoint[1]}` }] },
      餐饮: { count: 0, pois: [] }
    })
    const result = await search({ type: 'category', specify: '156310000', bounds: [121.47, 31.22, 121.52, 31.25], dataTypes: '金融,餐饮' }, TK)

    expect(result.kind).toBe('categories')
    if (result.kind !== 'categories') throw new Error('unreachable')
    const food = result.categories.find(c => c.name === '餐饮')!
    expect(food.count).toBe(0)
    expect(food.pois).toEqual([])
    expect(result.categories.find(c => c.name === '金融')!.pois).toHaveLength(1)
  })
})

describe('locate', () => {
  it('带 suggestedDistrict 时自动用 district 二次收窄，采用二次结果', async () => {
    mockJsonSequence(
      {
        resultType: 1,
        count: 13293,
        pois: [{ name: '沃尔玛购物广场上海南浦大桥店', lonlat: '121.51394,31.2056' }],
        prompt: [{ type: 4, admins: [{ adminName: '上海市', adminCode: 156310000 }] }]
      },
      {
        resultType: 1,
        count: 77,
        pois: [{ name: '南浦大桥', lonlat: `${rawPoint[0]},${rawPoint[1]}` }]
      }
    )
    const result = await locate('南浦大桥', {}, TK)

    expect(callCount()).toBe(2)
    expect(postStrAt(1).queryType).toBe(12)
    expect(postStrAt(1).specify).toBe('156310000')
    expect(result.kind).toBe('poi')
    if (result.kind !== 'poi') throw new Error('unreachable')
    expect(result.pois[0]!.name).toBe('南浦大桥')
  })

  it('无 suggestedDistrict 时只请求一次', async () => {
    mockJson({ resultType: 1, count: 1, pois: [{ name: '天安门', lonlat: `${rawPoint[0]},${rawPoint[1]}` }] })
    const result = await locate('天安门', {}, TK)

    expect(callCount()).toBe(1)
    expect(result.kind).toBe('poi')
  })

  it('显式传 bounds 时不做二次收窄', async () => {
    mockJson({
      resultType: 1,
      count: 1,
      pois: [{ name: '南浦大桥', lonlat: `${rawPoint[0]},${rawPoint[1]}` }],
      prompt: [{ type: 4, admins: [{ adminName: '上海市', adminCode: 156310000 }] }]
    })
    await locate('南浦大桥', { bounds: [120.85, 30.67, 122.2, 31.88] }, TK)

    expect(callCount()).toBe(1)
    expect(lastPostStr().queryType).toBe(1)
  })

  it('非 poi 结果直接返回，不做二次请求', async () => {
    mockJson({ status: { infocode: 3001 } })
    const result = await locate('不存在的地名', {}, TK)

    expect(callCount()).toBe(1)
    expect(result.kind).toBe('empty')
  })

  it('同名结果精确匹配优先排序', async () => {
    mockJson({
      resultType: 1,
      count: 2,
      pois: [
        { name: '南浦大桥管理所', lonlat: '121.4,31.2' },
        { name: '南浦大桥', lonlat: `${rawPoint[0]},${rawPoint[1]}` }
      ]
    })
    const result = await locate('南浦大桥', {}, TK)

    expect(result.kind).toBe('poi')
    if (result.kind !== 'poi') throw new Error('unreachable')
    expect(result.pois[0]!.name).toBe('南浦大桥')
  })
})

describe('searchNearby', () => {
  it('返回 POI 列表', async () => {
    mockJson({ resultType: 1, count: 1, pois: [{ name: '公园', lonlat: `${rawPoint[0]},${rawPoint[1]}` }] })
    const pois = await searchNearby('公园', [116.4, 39.9], { radius: 2000 }, TK)
    expect(pois).toHaveLength(1)
    expect(pois[0]!.name).toBe('公园')
  })

  it('非 POI 结果返回空数组', async () => {
    mockJson({ status: { infocode: 3001 } })
    const pois = await searchNearby('公园', [116.4, 39.9], {}, TK)
    expect(pois).toEqual([])
  })
})

describe('geocode', () => {
  it('地址解析成功，坐标保持 WGS84 透传', async () => {
    mockJson({ status: '0', msg: 'ok', location: { lon: String(rawPoint[0]), lat: String(rawPoint[1]), level: '门址', score: 100 } })
    const point = await geocode('北京市海淀区莲花池西路28号', TK)

    expect(point).toBeDefined()
    expect(point!.location[0]).toBeCloseTo(rawPoint[0], 4)
    expect(point!.level).toBe('门址')
    expect(point!.score).toBe(100)
    expect(lastUrl().searchParams.get('ds')).toContain('keyWord')
  })

  it('空结果（status 101）返回 undefined', async () => {
    mockJson({ status: '101' })
    expect(await geocode('不存在的地址', TK)).toBeUndefined()
  })

  it('错误（status 404）抛 TiandituError', async () => {
    mockJson({ status: '404', msg: 'error' })
    await expect(geocode('x', TK)).rejects.toBeInstanceOf(TiandituError)
  })

  it('score 低于阈值（纯地标/无门牌号地址常见）视为不可靠，返回 undefined', async () => {
    mockJson({ status: '0', msg: 'ok', location: { lon: '110.37', lat: '20.02', level: '区县及以上级行政区划', score: 33 } })
    expect(await geocode('上海南浦大桥', TK)).toBeUndefined()
  })
})

describe('reverseGeocode', () => {
  it('逆解析成功', async () => {
    mockJson({
      status: '0',
      msg: 'OK',
      result: { formatted_address: '北京市西城区大红罗厂街', addressComponent: { city: '北京市西城区', road: '大红罗厂街' } }
    })
    const result = await reverseGeocode([116.37, 39.92], TK)

    expect(result?.formattedAddress).toBe('北京市西城区大红罗厂街')
    expect(result?.city).toBe('北京市西城区')
    expect(result?.road).toBe('大红罗厂街')
    expect(lastUrl().searchParams.get('type')).toBe('geocode')
  })

  it('无地址返回 undefined', async () => {
    mockJson({ status: '0', result: {} })
    expect(await reverseGeocode([0, 0], TK)).toBeUndefined()
  })
})

describe('administrative', () => {
  it('解析 WKT MULTIPOLYGON 多多边形，坐标保持 WGS84 透传', async () => {
    mockJson({
      status: 200,
      message: '成功',
      data: {
        district: [{
          gb: '156110000',
          name: '北京市',
          level: 4,
          center: { lng: rawPoint[0], lat: rawPoint[1] },
          boundary: 'MULTIPOLYGON(((116.1 40.1, 116.2 40.1, 116.2 40.2, 116.1 40.1)),((117.1 40.5, 117.2 40.5, 117.2 40.6, 117.1 40.5)))',
          children: [{ gb: '156110100', name: '市辖区', level: 3, center: { lng: rawPoint[0], lat: rawPoint[1] } }]
        }]
      }
    })
    const divisions = await administrative('北京', { boundary: true, childLevel: 1 }, TK)

    expect(divisions).toHaveLength(1)
    expect(divisions[0]!.code).toBe('156110000')
    expect(divisions[0]!.center[0]).toBeCloseTo(rawPoint[0], 4)
    expect(divisions[0]!.boundary!.coordinates).toHaveLength(2)
    expect(divisions[0]!.boundary!.coordinates[0]![0]).toHaveLength(4)
    expect(divisions[0]!.children).toHaveLength(1)
  })

  it('status 非 200 抛 TiandituError', async () => {
    mockJson({ status: 400, message: '参数错误' })
    await expect(administrative('x', {}, TK)).rejects.toBeInstanceOf(TiandituError)
  })
})

describe('route', () => {
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<result>
  <simple>
    <item id='0'><strguide>沿长安街行驶</strguide></item>
    <item id='1'><strguide>右转进入王府井大街</strguide></item>
  </simple>
  <distance>5.2</distance>
  <duration>780</duration>
  <routelatlon>${rawPoint[0]},${rawPoint[1]};116.41,39.92;116.42,39.93</routelatlon>
  <mapinfo><center>${rawPoint[0]},${rawPoint[1]}</center><scale>12</scale></mapinfo>
</result>`

  it('解析 XML 路线、距离、时长、摘要与 mapinfo', async () => {
    mockText(xml)
    const result = await route([116.35, 39.92], [116.42, 39.93], { mode: 'fastest' }, TK)

    expect(result.distanceKm).toBe(5.2)
    expect(result.durationMinutes).toBe(13)
    expect(result.path.coordinates).toHaveLength(3)
    expect(result.path.coordinates[0]![0]).toBeCloseTo(rawPoint[0], 4)
    expect(result.summary).toBe('沿长安街行驶 右转进入王府井大街')
    expect(result.center![0]).toBeCloseTo(rawPoint[0], 4)
    expect(result.scale).toBe(12)
  })

  it('途经点组装 mid 参数', async () => {
    mockText(xml)
    await route([116.35, 39.92], [116.42, 39.93], { waypoints: [[116.4, 39.92]] }, TK)
    const post = lastPostStr()
    expect(post.mid).toBe('116.4,39.92')
  })

  it('无路线抛 TiandituError', async () => {
    mockText('<result><distance>0</distance></result>')
    await expect(route([0, 0], [1, 1], {}, TK)).rejects.toBeInstanceOf(TiandituError)
  })
})

describe('createTianditu', () => {
  it('工厂绑定 tk，各方法免传', async () => {
    mockJson({ resultType: 1, count: 0, pois: [] })
    const td = createTianditu({ tk: TK })
    await td.searchNearby('公园', [116.4, 39.9])
    expect(lastUrl().searchParams.get('tk')).toBe(TK)
  })
})
