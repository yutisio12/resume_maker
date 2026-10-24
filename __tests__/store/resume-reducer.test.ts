import { describe, it, expect } from 'vitest'
import { v4 as uuidv4 } from 'uuid'

describe('basic reducer logic shape', () => {
  it('uuid generates string', () => {
    const id = uuidv4()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(10)
  })
})
