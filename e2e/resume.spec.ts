import path from 'node:path'
import { test, expect } from '@playwright/test'

test.describe('Resume Maker', () => {
  test('menampilkan form, preview, dan watermark', async ({ page }) => {
    const pageErrors: string[] = []
    page.on('pageerror', (error) => pageErrors.push(error.message))

    await page.goto('/')

    await expect(page.locator('.form-panel').getByLabel('Nama Lengkap')).toBeVisible()
    await expect(page.locator('#resume-preview')).toBeVisible()
    await expect(page.locator('#resume-preview .resume-watermark').first()).toBeVisible()
    expect(pageErrors).toEqual([])
  })

  test('import sample JSON dan menerapkan draft', async ({ page }) => {
    await page.goto('/')

    await page.getByLabel('Import JSON').click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page
      .locator('input[type=file][accept*="json"]')
      .setInputFiles(path.join(process.cwd(), 'public', 'sample-resume.json'))

    await expect(page.locator('#import-preview').getByText('Nama Contoh')).toBeVisible()
    await page.getByRole('button', { name: 'Ganti draft' }).click()

    await expect(page.locator('#resume-preview').getByText('Nama Contoh')).toBeVisible()
    await expect(page.locator('#resume-preview')).toContainText('Frontend Developer')
  })

  test('mode print hanya menampilkan CV', async ({ page }) => {
    await page.goto('/')
    await page.emulateMedia({ media: 'print' })

    await expect(page.locator('#resume-preview-print')).toBeVisible()
    await expect(page.getByLabel('Import JSON')).toBeHidden()
  })
})
