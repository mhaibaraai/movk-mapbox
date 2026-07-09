import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Plugin } from 'vite'
import type { RouteMode, SearchParams } from '../../../src/runtime/types'
import type { TiandituClient } from '../../../src/runtime/utils/tianditu-client'
import { createTianditu } from '../../../src/runtime/utils/tianditu-client'

interface TiandituDevServerOptions {
  /** 天地图服务端类型 tk（IP 白名单校验），不下发到浏览器 */
  token?: string
}

class ApiError extends Error {
  constructor(readonly statusCode: number, message: string) {
    super(message)
  }
}

// URLSearchParams.get() 缺参时返回 null，而 Number(null) === 0（非 NaN），
// 必须先判空再转数字，否则缺参会被当成合法的 0 坐标放行
function num(value: string | null): number {
  return value === null ? Number.NaN : Number(value)
}

function parseBounds(value: string | null): [number, number, number, number] {
  const parts = (value ?? '').split(',').map(Number)
  if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) {
    throw new ApiError(400, 'bounds must be "minx,miny,maxx,maxy"')
  }
  return parts as [number, number, number, number]
}

function parsePolygon(value: string | null): [number, number][] {
  const points = (value ?? '').split(';').filter(Boolean).map((pair) => {
    const [lng, lat] = pair.split(',').map(Number)
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw new ApiError(400, 'polygon must be "lng1,lat1;lng2,lat2;..."')
    }
    return [lng!, lat!] as [number, number]
  })
  if (points.length < 3) throw new ApiError(400, 'polygon requires at least 3 points')
  return points
}

type Handler = (params: URLSearchParams, client: TiandituClient) => Promise<unknown>

// 逐条口径对齐 playgrounds/play/server/api/tianditu-*.get.ts 的参数校验与调用
const routes: Record<string, Handler> = {
  '/api/tianditu-administrative': async (params, client) => {
    const keyword = params.get('keyword')
    if (!keyword) throw new ApiError(400, 'keyword is required')
    const childLevel = params.get('childLevel')
    return {
      divisions: await client.administrative(keyword, {
        boundary: true,
        childLevel: childLevel ? Number(childLevel) as 0 | 1 | 2 | 3 : 1
      })
    }
  },
  '/api/tianditu-forward-geocode': async (params, client) => {
    const address = params.get('address')
    if (!address) throw new ApiError(400, 'address is required')
    return await client.geocode(address) ?? null
  },
  '/api/tianditu-geocode': async (params, client) => {
    const keyword = params.get('keyword')
    if (!keyword) throw new ApiError(400, 'keyword is required')
    const boundsRaw = params.get('bounds')
    const level = params.get('level')
    return await client.locate(keyword, {
      bounds: boundsRaw ? parseBounds(boundsRaw) : undefined,
      level: level ? Number(level) : undefined
    })
  },
  '/api/tianditu-reverse-geocode': async (params, client) => {
    const lng = num(params.get('longitude'))
    const lat = num(params.get('latitude'))
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) throw new ApiError(400, 'longitude, latitude are required')
    return await client.reverseGeocode([lng, lat]) ?? {}
  },
  '/api/tianditu-route': async (params, client) => {
    const orig: [number, number] = [num(params.get('origLng')), num(params.get('origLat'))]
    const dest: [number, number] = [num(params.get('destLng')), num(params.get('destLat'))]
    if (orig.some(n => !Number.isFinite(n)) || dest.some(n => !Number.isFinite(n))) {
      throw new ApiError(400, 'origLng/origLat/destLng/destLat are required')
    }
    const mode = params.get('mode') as RouteMode | null
    return await client.route(orig, dest, { mode: mode || 'fastest' })
  },
  '/api/tianditu-search': async (params, client) => {
    const keyword = params.get('keyword')
    const lng = num(params.get('longitude'))
    const lat = num(params.get('latitude'))
    if (!keyword || !Number.isFinite(lng) || !Number.isFinite(lat)) {
      throw new ApiError(400, 'keyword, longitude, latitude are required')
    }
    const radius = params.get('radius')
    const results = await client.searchNearby(keyword, [lng, lat], {
      radius: radius ? Number(radius) : undefined
    })
    return { results }
  },
  '/api/tianditu-search-types': async (params, client) => {
    const keyword = params.get('keyword') ?? undefined
    const specify = params.get('specify') ?? undefined

    let query: SearchParams
    switch (params.get('type')) {
      case 'inView':
        query = { type: 'inView', keyword: keyword ?? '', bounds: parseBounds(params.get('bounds')), level: Number(params.get('level') ?? 12) }
        break
      case 'polygon':
        query = { type: 'polygon', keyword: keyword ?? '', polygon: parsePolygon(params.get('polygon')) }
        break
      case 'district':
        if (!specify) throw new ApiError(400, 'specify is required')
        query = { type: 'district', specify, keyword }
        break
      case 'category':
        if (!specify) throw new ApiError(400, 'specify is required')
        query = { type: 'category', specify, bounds: parseBounds(params.get('bounds')), dataTypes: params.get('dataTypes') ?? '' }
        break
      case 'statistics':
        if (!specify) throw new ApiError(400, 'specify is required')
        query = { type: 'statistics', specify, keyword }
        break
      default:
        throw new ApiError(400, 'type must be one of inView/polygon/district/category/statistics')
    }

    return await client.search(query)
  }
}

/**
 * 开发期 Vite 插件：镜像 playgrounds/play 的 server/api/tianditu-*.get.ts，
 * 让纯 Vite 环境下复用的天地图演示页也能通过 $fetch('/api/tianditu-*') 调用服务端专用接口。
 */
export function tiandituDevServer(options: TiandituDevServerOptions = {}): Plugin {
  return {
    name: 'movk:tianditu-dev-server',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: (err?: unknown) => void) => {
        const url = new URL(req.url ?? '/', 'http://localhost')
        const handler = routes[url.pathname]
        if (!handler) {
          next()
          return
        }

        try {
          if (!options.token) throw new ApiError(500, 'TIANDITU_API_TOKEN is not configured')
          const data = await handler(url.searchParams, createTianditu({ tk: options.token }))
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(data))
        } catch (err) {
          const statusCode = err instanceof ApiError ? err.statusCode : 500
          const statusMessage = err instanceof Error ? err.message : String(err)
          res.statusCode = statusCode
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ statusCode, statusMessage }))
        }
      })
    }
  }
}
