import type { SearchParams } from '#mapbox/types'

function parseBounds(value: unknown): [number, number, number, number] {
  const parts = String(value ?? '').split(',').map(Number)
  if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) {
    throw createError({ statusCode: 400, statusMessage: 'bounds must be "minx,miny,maxx,maxy"' })
  }
  return parts as [number, number, number, number]
}

function parsePolygon(value: unknown): [number, number][] {
  const points = String(value ?? '').split(';').filter(Boolean).map((pair) => {
    const [lng, lat] = pair.split(',').map(Number)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw createError({ statusCode: 400, statusMessage: 'polygon must be "lng1,lat1;lng2,lat2;..."' })
    }
    return [lng!, lat!] as [number, number]
  })
  if (points.length < 3) {
    throw createError({ statusCode: 400, statusMessage: 'polygon requires at least 3 points' })
  }
  return points
}

/** 演示 search() 除 normal/nearby 外的 5 种 queryType：inView/polygon/district/category/statistics。 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const keyword = typeof query.keyword === 'string' ? query.keyword : undefined
  const specify = typeof query.specify === 'string' ? query.specify : undefined

  let params: SearchParams
  switch (query.type) {
    case 'inView':
      params = { type: 'inView', keyword: keyword ?? '', bounds: parseBounds(query.bounds), level: Number(query.level ?? 12) }
      break
    case 'polygon':
      params = { type: 'polygon', keyword: keyword ?? '', polygon: parsePolygon(query.polygon) }
      break
    case 'district':
      if (!specify) throw createError({ statusCode: 400, statusMessage: 'specify is required' })
      params = { type: 'district', specify, keyword }
      break
    case 'category':
      if (!specify) throw createError({ statusCode: 400, statusMessage: 'specify is required' })
      params = { type: 'category', specify, bounds: parseBounds(query.bounds), dataTypes: String(query.dataTypes ?? '') }
      break
    case 'statistics':
      if (!specify) throw createError({ statusCode: 400, statusMessage: 'specify is required' })
      params = { type: 'statistics', specify, keyword }
      break
    default:
      throw createError({ statusCode: 400, statusMessage: 'type must be one of inView/polygon/district/category/statistics' })
  }

  return await useTianditu().search(params)
})
