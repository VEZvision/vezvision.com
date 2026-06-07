import { test, expect } from '@playwright/test'

test.describe('Route error boundary', () => {
  test('shows chrome and recovery actions on forced route error', async ({ page }) => {
    await page.goto('/__e2e__/error')

    await expect(page.getByRole('navigation').first()).toBeVisible()
    await expect(page.getByRole('contentinfo')).toBeVisible()
    await expect(
      page.getByRole('heading', { name: /coś poszło nie tak|something went wrong/i }),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: /strona główna|home/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /odśwież|retry|refresh/i })).toBeVisible()
  })
})
