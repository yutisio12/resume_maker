import { describe, it, expect } from 'vitest'
import { sanitizeHtml, stripHtml } from '@/lib/utils/sanitize'

describe('sanitizeHtml', () => {
  it('blocks script tags', () => {
    const result = sanitizeHtml('<script>alert(1)</script><p>halo</p>')
    expect(result).not.toContain('<script')
    expect(result).toContain('halo')
  })

  it('blocks onclick attribute', () => {
    const result = sanitizeHtml(\"<p onclick='alert(1)'>x</p>\")
    expect(result).not.toContain('onclick')
  })

  it('blocks javascript: links', () => {
    const result = sanitizeHtml(\"<a href='javascript:alert(1)'>klik</a>\")
    expect(result).not.toContain('javascript:')
  })

  it('allows safe tags', () => {
    const result = sanitizeHtml('<strong>Halo</strong><ul><li>test</li></ul>')
    expect(result).toContain('<strong>')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>')
  })
})

describe('stripHtml', () => {
  it('strips tags to text', () => {
    const result = stripHtml('<p>Halo <strong>Dunia</strong></p>')
    expect(result).toContain('Halo')
    expect(result).toContain('Dunia')
    expect(result).not.toContain('<p>')
  })
})
