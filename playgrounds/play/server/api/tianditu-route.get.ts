import type { RouteMode } from '#mapbox/types'

export default defineEventHandler(async (event) => {
  const { origLng, origLat, destLng, destLat, mode } = getQuery(event)
  const orig: [number, number] = [Number(origLng), Number(origLat)]
  const dest: [number, number] = [Number(destLng), Number(destLat)]
  if (orig.some(n => !Number.isFinite(n)) || dest.some(n => !Number.isFinite(n))) {
    throw createError({ statusCode: 400, statusMessage: 'origLng/origLat/destLng/destLat are required' })
  }

  return await useTianditu().route(orig, dest, { mode: (mode as RouteMode) || 'fastest' })
})
