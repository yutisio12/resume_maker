import { describe, it, expect } from 'vitest'
import { getWatermarkFingerprint } from '@/lib/watermark'

describe('watermark', () => {
  it('contains only the document id without brand, website, or timestamp', () => {
    const fingerprint = getWatermarkFingerprint({ id: 'doc-123' })

    expect(fingerprint).toBe('doc:doc-123')
    expect(fingerprint).not.toContain('Create')
    expect(fingerprint).not.toContain('github.com')
    expect(fingerprint).not.toContain('2026')
  })
})
