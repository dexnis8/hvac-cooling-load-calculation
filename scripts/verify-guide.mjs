import { chromium, expect } from '@playwright/test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const page = await browser.newPage()
const errors = []
page.on('pageerror', error => errors.push(error.message))
const checks = []
for (const width of [1440, 1024, 768, 390]) {
  await page.setViewportSize({ width, height: 900 })
  await page.goto('http://127.0.0.1:5173/#guide-start')
  await expect(page.getByRole('heading', { level: 1, name: 'User guide' })).toBeVisible()
  await expect(page.locator('.guide-article > section')).toHaveCount(8)
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth))
  await page.getByRole('navigation', { name: 'User guide contents' }).getByRole('link', { name: /Understand the inputs/ }).click()
  await expect(page).toHaveURL(/#guide-inputs$/)
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'User guide' })).toBeVisible()
  await page.evaluate(() => window.scrollTo(0, 0))
  if ([1440, 390].includes(width)) await page.screenshot({ path: `artifacts/user-guide-${width}.png`, animations: 'disabled' })
  checks.push(`User guide: ${width}px, eight sections, no page overflow, working contents and direct links.`)
}
await page.setViewportSize({ width: 1440, height: 1080 })
await page.getByRole('button', { name: 'Open project overview', exact: true }).click()
await expect(page.getByRole('heading', { level: 1, name: 'Project overview' })).toBeVisible()
await page.getByRole('button', { name: 'User guide', exact: true }).click()
await expect(page.getByRole('heading', { level: 1, name: 'User guide' })).toBeVisible()
assert.equal(errors.length, 0, errors.join('\n'))
await writeFile('artifacts/guide-verification.txt', checks.join('\n'))
console.log(checks.join('\n'))
await browser.close()
