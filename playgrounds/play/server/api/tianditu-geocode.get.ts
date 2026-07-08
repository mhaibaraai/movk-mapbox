export default defineEventHandler(async (event) => {
  const { keyword, bounds, level } = getQuery(event)
  if (typeof keyword !== 'string' || !keyword) {
    throw createError({ statusCode: 400, statusMessage: 'keyword is required' })
  }

  let parsedBounds: [number, number, number, number] | undefined
  if (typeof bounds === 'string') {
    const parts = bounds.split(',').map(Number)
    if (parts.length !== 4 || parts.some(n => !Number.isFinite(n))) {
      throw createError({ statusCode: 400, statusMessage: 'bounds must be "minx,miny,maxx,maxy"' })
    }
    parsedBounds = parts as [number, number, number, number]
  }

  return await useTianditu().locate(keyword, {
    bounds: parsedBounds,
    level: level ? Number(level) : undefined
  })
})
