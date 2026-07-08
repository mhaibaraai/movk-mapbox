export default defineEventHandler(async (event) => {
  const { keyword, longitude, latitude, radius } = getQuery(event)
  const lng = Number(longitude)
  const lat = Number(latitude)
  if (typeof keyword !== 'string' || !keyword || !Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw createError({ statusCode: 400, statusMessage: 'keyword, longitude, latitude are required' })
  }

  const results = await useTianditu().searchNearby(keyword, [lng, lat], {
    radius: radius ? Number(radius) : undefined
  })
  return { results }
})
