import { expect, test } from '@playwright/test'

test('home page renders and exposes core navigation', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle(/VezVision/i)
  await expect(page.getByRole('navigation').first()).toBeVisible()
  await expect(page.getByRole('main')).toBeVisible()
})

test('contact page renders the contact form', async ({ page }) => {
  await page.goto('/contact')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.locator('input[name="fullName"]')).toBeVisible()
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('textarea[name="message"]')).toBeVisible()
})

test('unknown routes render a not-found page', async ({ page }) => {
  await page.goto('/definitely-not-a-real-page')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('heading', { name: /not found|nie znaleziono/i })).toBeVisible()
})
