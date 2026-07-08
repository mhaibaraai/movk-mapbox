export default defineEventHandler(async (event) => {
  const { keyword, childLevel } = getQuery(event)
  if (typeof keyword !== 'string' || !keyword) {
    throw createError({ statusCode: 400, statusMessage: 'keyword is required' })
  }

  return {
    divisions: await useTianditu().administrative(keyword, {
      boundary: true,
      childLevel: childLevel ? Number(childLevel) as 0 | 1 | 2 | 3 : 1
    })
  }
})
