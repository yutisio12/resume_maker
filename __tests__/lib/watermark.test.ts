import { describe, it, expect } from 'vitest'
import { WATERMARK_BRAND, getWatermarkFingerprint } from '@/lib/watermark'

describe('watermark', () => {
  it('contains the brand and document identity without personal data', () => {
    const fingerprint = getWatermarkFingerprint({
      id: 'doc-123',
      metadata: {
        createdAt: '2026-01-02T03:04:05.000Z',
        updatedAt: '2026-01-03T03:04:05.000Z',
      },
    })

    expect(fingerprint).toContain(WATERMARK_BRAND)
    expect(fingerprint).toContain('doc-123')
    expect(fingerprint).toContain('2026-01-02T03:04:05.000Z')
    expect(fingerprint).not.toContain('Nama')
  })
})
