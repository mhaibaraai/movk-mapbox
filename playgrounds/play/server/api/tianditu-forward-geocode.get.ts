export default defineEventHandler(async (event) => {
  const { address } = getQuery(event)
  if (typeof address !== 'string' || !address) {
    throw createError({ statusCode: 400, statusMessage: 'address is required' })
  }

  return await useTianditu().geocode(address) ?? null
})
