import { expect, test } from '@playwright/test'

test('home page renders and exposes core navigation', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveURL(/\/(pl|en)\/?$/)
  await expect(page).toHaveTitle(/VezVision/i)
  await expect(page.getByRole('navigation').first()).toBeVisible()
  await expect(page.getByRole('main')).toBeVisible()
})

test('contact page renders the contact form', async ({ page }) => {
  await page.goto('/pl/contact')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.locator('input[name="fullName"]')).toBeVisible()
  await expect(page.locator('input[name="email"]')).toBeVisible()
  await expect(page.locator('textarea[name="message"]')).toBeVisible()
})

test('language toggle switches locale in the URL', async ({ page }) => {
  await page.goto('/pl/contact')
  await page.waitForLoadState('networkidle')
  const desktopLang = page.getByTestId('language-toggle-desktop')
  const mobileMenuToggle = page.getByTestId('mobile-menu-toggle')
  if (await desktopLang.isVisible()) {
    await desktopLang.click()
  } else {
    await mobileMenuToggle.click()
    await page.getByTestId('language-toggle-mobile').click()
  }
  await expect(page).toHaveURL(/\/en\/contact/)
})

test('cookie banner is visible on first visit', async ({ page }) => {
  await page.goto('/pl/')
  await expect(page.locator('#cookie-banner-title')).toBeVisible()
})

test('unknown routes render a not-found page', async ({ page }) => {
  await page.goto('/pl/definitely-not-a-real-page')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.getByRole('heading', { name: /not found|nie znaleziono|nie została znaleziona/i })).toBeVisible()
})

test('legal pages include site footer navigation', async ({ page }) => {
  await page.goto('/pl/privacy-policy')

  await expect(page.getByRole('contentinfo')).toBeVisible()
})

test('legacy routes without locale redirect to localized paths', async ({ page }) => {
  await page.goto('/contact')
  await expect(page).toHaveURL(/\/(pl|en)\/contact/)
})

test('not-found page includes site footer navigation', async ({ page }) => {
  await page.goto('/pl/definitely-not-a-real-page')

  await expect(page.getByRole('contentinfo')).toBeVisible()
})

test('newsletter page renders signup section', async ({ page }) => {
  await page.goto('/pl/newsletter')

  await expect(page.getByRole('main')).toBeVisible()
  await expect(page.locator('input[type="email"]').first()).toBeVisible()
})

test('blog list page loads under localized route', async ({ page }) => {
  await page.goto('/pl/blog')

  await expect(page).toHaveURL(/\/pl\/blog/)
  await expect(page.getByRole('main')).toBeVisible()
})

test('contact form shows validation when submitted empty', async ({ page }) => {
  await page.goto('/pl/contact')
  await page.getByRole('button', { name: /wyślij wiadomość|send message/i }).click()
  await expect(page.locator('input[name="fullName"][aria-invalid="true"]')).toBeVisible()
})

test('unknown portfolio project is noindex', async ({ page }) => {
  await page.goto('/pl/portfolio/this-project-definitely-does-not-exist-xyz')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i)
})
