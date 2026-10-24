import { describe, it, expect } from 'vitest'
import { createDefaultResume } from '@/lib/constants/defaults'

describe('createDefaultResume', () => {
  it('has required fields', () => {
    const doc = createDefaultResume()
    expect(doc.schemaVersion).toBe(1)
    expect(doc.personalInfo).toBeDefined()
    expect(doc.sections).toBeInstanceOf(Array)
    expect(doc.settings).toBeDefined()
    expect(doc.settings.template).toBe('ats-classic')
  })

  it('has default sections', () => {
    const doc = createDefaultResume()
    const types = doc.sections.map(s => s.type)
    expect(types).toContain('experience')
    expect(types).toContain('education')
    expect(types).toContain('skills')
  })
})
