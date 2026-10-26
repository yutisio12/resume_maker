import { describe, it, expect } from 'vitest'
import { sanitizeExternalUrl, sanitizeHtml, sanitizeUrl, stripHtml } from '@/lib/utils/sanitize'

describe('sanitizeHtml', () => {
  it('blocks script tags', () => {
    const result = sanitizeHtml('<script>alert(1)</script><p>halo</p>')
    expect(result).not.toContain('<script')
    expect(result).toContain('halo')
  })

  it('blocks onclick attribute', () => {
    const result = sanitizeHtml("<p onclick='alert(1)'>x</p>")
    expect(result).not.toContain('onclick')
  })

  it('blocks onerror attributes and iframes', () => {
    const result = sanitizeHtml('<img src="x" onerror="alert(1)"><iframe src="https://evil.example"></iframe><p>aman</p>')
    expect(result).not.toContain('onerror')
    expect(result).not.toContain('<iframe')
    expect(result).toContain('aman')
  })

  it('blocks javascript: links', () => {
    const result = sanitizeHtml("<a href='javascript:alert(1)'>klik</a>")
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

describe('sanitizeUrl', () => {
  it('allows http, https, mailto, and tel', () => {
    expect(sanitizeUrl('https://example.com')).toBe('https://example.com/')
    expect(sanitizeUrl('http://example.com')).toBe('http://example.com/')
    expect(sanitizeUrl('mailto:nama@example.com')).toBe('mailto:nama@example.com')
    expect(sanitizeUrl('tel:+628123456789')).toBe('tel:+628123456789')
  })

  it('blocks javascript and protocol-relative URLs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeUrl(' java\nscript:alert(1)')).toBe('')
    expect(sanitizeUrl('//evil.example.com')).toBe('')
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('')
  })

  it('adds safe rel and target to links', () => {
    const result = sanitizeHtml('<a href="https://example.com">contoh</a>')
    expect(result).toContain('rel="noopener noreferrer"')
    expect(result).toContain('target="_blank"')
  })
})

describe('sanitizeExternalUrl', () => {
  it('adds https to bare domains', () => {
    expect(sanitizeExternalUrl('linkedin.com/in/contoh')).toBe('https://linkedin.com/in/contoh')
    expect(sanitizeExternalUrl('example.com')).toBe('https://example.com/')
  })

  it('keeps safe schemes and rejects unknown ones', () => {
    expect(sanitizeExternalUrl('https://example.com/path')).toBe('https://example.com/path')
    expect(sanitizeExternalUrl('javascript:alert(1)')).toBe('')
    expect(sanitizeExternalUrl('ftp://example.com')).toBe('')
    expect(sanitizeExternalUrl('//evil.example.com')).toBe('')
  })
})
