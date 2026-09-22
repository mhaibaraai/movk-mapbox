/**
 * 纯数据结构化比较（原始值、数组、对象自有可枚举键）。
 * 用于组件 options 等值判定：模板内联字面量每次渲染都是新引用，值相同应视为未变。
 */
export function isDeepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a) !== Array.isArray(b)) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  return keysA.every(key =>
    Object.prototype.hasOwnProperty.call(b, key)
    && isDeepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
  )
}
