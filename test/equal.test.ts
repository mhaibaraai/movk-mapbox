import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { isDeepEqual } from '../src/runtime/utils/equal'

describe('isDeepEqual', () => {
  it('原始值按 Object.is 比较', () => {
    expect(isDeepEqual(1, 1)).toBe(true)
    expect(isDeepEqual(Number.NaN, Number.NaN)).toBe(true)
    expect(isDeepEqual('a', 'b')).toBe(false)
    expect(isDeepEqual(undefined, null)).toBe(false)
  })

  it('数组与对象按结构递归比较', () => {
    expect(isDeepEqual([0, [1, 2]], [0, [1, 2]])).toBe(true)
    expect(isDeepEqual({ offset: { top: [0, 1] } }, { offset: { top: [0, 1] } })).toBe(true)
    expect(isDeepEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false)
    expect(isDeepEqual({ a: undefined }, { b: undefined })).toBe(false)
    expect(isDeepEqual([1], { 0: 1 })).toBe(false)
  })

  it('reactive 代理与普通对象值相同视为相等', () => {
    expect(isDeepEqual(reactive({ offset: [0, 1] }), { offset: [0, 1] })).toBe(true)
  })
})
