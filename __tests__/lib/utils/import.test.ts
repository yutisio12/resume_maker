import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { createDefaultResume } from '@/lib/constants/defaults'
import { parseResumeJson, toResumeDocument } from '@/lib/utils/import'
import {
  MAX_ITEMS_PER_SECTION,
  MAX_SECTIONS,
  MAX_TEXT_LENGTH,
  resumeDocumentSchema,
} from '@/lib/models/schema'

describe('parseResumeJson', () => {
  it('accepts the public sample document', () => {
    const sample = readFileSync('public/sample-resume.json', 'utf8')
    const result = parseResumeJson(sample)

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.document.sections.length).toBeGreaterThan(0)
    expect(result.document.sections.some((section) => section.type === 'education')).toBe(true)
  })

  it('accepts a valid Resume Maker document', () => {
    const doc = createDefaultResume()
    doc.personalInfo.photoId = 'photo-lama'
    doc.personalInfo.showPhoto = true

    const result = parseResumeJson(JSON.stringify(doc))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.document.schemaVersion).toBe(1)
    expect(result.document.personalInfo.photoId).toBeNull()
    expect(result.document.personalInfo.showPhoto).toBe(false)
    expect(result.document.settings.template).toBe('ats-classic')
  })

  it('rejects invalid JSON', () => {
    const result = parseResumeJson('{bukan json')
    expect(result.ok).toBe(false)
  })

  it('rejects an unknown schema version', () => {
    const doc = { ...createDefaultResume(), schemaVersion: 2 }
    const result = parseResumeJson(JSON.stringify(doc))
    expect(result.ok).toBe(false)
  })

  it('rejects a document without required fields', () => {
    const result = parseResumeJson(JSON.stringify({ schemaVersion: 1 }))
    expect(result.ok).toBe(false)
  })

  it('sanitizes HTML and unsafe links from imported content', () => {
    const doc = createDefaultResume()
    doc.summary = {
      html: '<p>Saya aman</p><script>alert(1)</script><a href="javascript:alert(1)">klik</a>',
      text: 'Saya aman',
    }
    doc.personalInfo.website = 'javascript:alert(1)'
    doc.sections[0].items = [{
      id: 'item-1',
      position: 'Developer',
      url: 'javascript:alert(1)',
      description: { html: '<p onclick="alert(1)">Teks</p>', text: 'Teks' },
    }]

    const result = parseResumeJson(JSON.stringify(doc))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.document.summary.html).not.toContain('<script')
    expect(result.document.summary.html).not.toContain('javascript:')
    expect(result.document.personalInfo.website).toBe('')
    expect(result.document.sections[0].items[0].url).toBe('')
    expect(result.document.sections[0].items[0].description?.html).not.toContain('onclick')
  })

  it('falls back for an unknown template and font', () => {
    const doc = createDefaultResume()
    doc.settings.template = 'unknown' as 'ats-classic'
    doc.settings.fontFamily = 'Comic Sans'
    const result = parseResumeJson(JSON.stringify(doc))

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.document.settings.template).toBe('ats-classic')
    expect(result.document.settings.fontFamily).toBe('Arial')
  })

  it('rejects too many sections', () => {
    const doc = createDefaultResume()
    const base = doc.sections[0]
    doc.sections = Array.from({ length: MAX_SECTIONS + 1 }, (_, index) => ({
      ...base,
      id: `section-${index}`,
    }))

    expect(parseResumeJson(JSON.stringify(doc)).ok).toBe(false)
  })

  it('rejects too many items in one section', () => {
    const doc = createDefaultResume()
    doc.sections = [{
      id: 'section-1',
      type: 'experience',
      title: 'Pengalaman',
      visible: true,
      order: 0,
      items: Array.from({ length: MAX_ITEMS_PER_SECTION + 1 }, (_, index) => ({
        id: `item-${index}`,
        position: 'Developer',
      })),
    }]

    expect(parseResumeJson(JSON.stringify(doc)).ok).toBe(false)
  })

  it('rejects an oversized text field', () => {
    const doc = createDefaultResume()
    doc.personalInfo.fullName = 'a'.repeat(MAX_TEXT_LENGTH + 1)

    expect(parseResumeJson(JSON.stringify(doc)).ok).toBe(false)
  })

  it('rejects a stored draft with a malformed shape', () => {
    const doc = { ...createDefaultResume(), sections: 'bukan array' }

    expect(resumeDocumentSchema.safeParse(doc).success).toBe(false)
  })

  it('keeps photo references only when explicitly restoring a draft', () => {
    const doc = createDefaultResume()
    doc.personalInfo.photoId = 'photo-1'
    doc.personalInfo.showPhoto = true
    doc.settings.showPhoto = true

    const parsed = resumeDocumentSchema.parse(doc)
    const imported = toResumeDocument(parsed)
    expect(imported.personalInfo.photoId).toBeNull()
    expect(imported.personalInfo.showPhoto).toBe(false)
    expect(imported.settings.showPhoto).toBe(false)

    const restored = toResumeDocument(parsed, { keepPhoto: true })
    expect(restored.personalInfo.photoId).toBe('photo-1')
    expect(restored.personalInfo.showPhoto).toBe(true)
    expect(restored.settings.showPhoto).toBe(true)
  })
})
