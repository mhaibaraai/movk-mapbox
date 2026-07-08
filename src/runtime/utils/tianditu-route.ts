import type { LineString } from 'geojson'
import type { RouteMode, RouteOptions, RouteResult } from '../types'
import { formatLngLat, getText, parseLngLat, TIANDITU_ENDPOINTS, TiandituError } from './tianditu-request'

// mode → 天地图 style：0 最快、1 最短、2 避开高速、3 步行（步行与驾车共用同一接口）
const STYLE_MAP: Record<RouteMode, string> = {
  'fastest': '0',
  'shortest': '1',
  'avoid-highway': '2',
  'walking': '3'
}

// 天地图驾车接口返回 XML（文档未提及，也未给字段表）。字段均为无嵌套的叶子标签，按标签名正则提取即可。
function tag(xml: string, name: string): string | undefined {
  return new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(xml)?.[1]
}

/** 驾车/步行路线规划：返回真实道路路径与真实距离/时长。未找到路线抛 TiandituError。 */
export async function route(
  origin: [number, number],
  destination: [number, number],
  options: RouteOptions,
  tk: string
): Promise<RouteResult> {
  const postStr: Record<string, string> = {
    orig: formatLngLat(origin),
    dest: formatLngLat(destination),
    style: STYLE_MAP[options.mode ?? 'fastest']
  }
  if (options.waypoints?.length) {
    postStr.mid = options.waypoints.map(formatLngLat).join(';')
  }

  const xml = await getText(TIANDITU_ENDPOINTS.drive, { postStr: JSON.stringify(postStr), type: 'search' }, tk)

  // routelatlon 是整条路线的密集折线，作单一来源，不拼接 <simple> 分段
  const routelatlon = tag(xml, 'routelatlon')
  if (!routelatlon) throw new TiandituError('no-route', '天地图未返回路线')

  const path: LineString = {
    type: 'LineString',
    coordinates: routelatlon.trim().replace(/;$/, '').split(';').map(parseLngLat)
  }

  // strguide 在 <routes>（细）与 <simple>（粗）两段都有，取 <simple> 的简明转向摘要避免重复
  const simple = /<simple>([\s\S]*?)<\/simple>/.exec(xml)?.[1] ?? ''
  const guides = [...simple.matchAll(/<strguide>([\s\S]*?)<\/strguide>/g)].map(m => m[1]!.trim())

  // mapinfo.center/scale 适合直接喂给 fitBounds/flyTo 相机
  const mapinfo = /<mapinfo>([\s\S]*?)<\/mapinfo>/.exec(xml)?.[1] ?? ''
  const centerRaw = tag(mapinfo, 'center')
  const scaleRaw = tag(mapinfo, 'scale')

  return {
    distanceKm: Number(tag(xml, 'distance') ?? 0),
    durationMinutes: Math.round((Number(tag(xml, 'duration') ?? 0) / 60) * 10) / 10,
    path,
    summary: guides.length ? guides.join(' ') : undefined,
    center: centerRaw ? parseLngLat(centerRaw) : undefined,
    scale: scaleRaw ? Number(scaleRaw.trim()) : undefined
  }
}
