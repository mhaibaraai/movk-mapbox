export default defineEventHandler(async (event) => {
  const { longitude, latitude } = getQuery(event)
  const lng = Number(longitude)
  const lat = Number(latitude)
  if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
    throw createError({ statusCode: 400, statusMessage: 'longitude, latitude are required' })
  }

  return await useTianditu().reverseGeocode([lng, lat]) ?? {}
})
