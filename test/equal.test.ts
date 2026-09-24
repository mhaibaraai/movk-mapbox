import { describe, expect, it } from 'vitest'
import { reactive } from 'vue'
import { isDeepEqual } from '@movk/core'

// options 值判定依赖 @movk/core 的 isDeepEqual；props 为 reactive 代理，需与普通对象按值相等
describe('isDeepEqual', () => {
  it('reactive 代理与普通对象值相同视为相等', () => {
    expect(isDeepEqual(reactive({ offset: [0, 1] }), { offset: [0, 1] })).toBe(true)
  })
})
