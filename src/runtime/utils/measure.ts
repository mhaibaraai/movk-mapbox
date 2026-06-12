/** 距离格式化：千米以下取整米，以上保留两位 km。 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

/** 面积格式化：平方千米以下取整平方米，以上保留两位 km²。 */
export function formatArea(squareMeters: number): string {
  if (squareMeters < 1_000_000) return `${Math.round(squareMeters)} m²`
  return `${(squareMeters / 1_000_000).toFixed(2)} km²`
}
