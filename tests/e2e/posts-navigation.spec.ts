import { expect, test } from '@playwright/test'

test('opens the Posts page from the homepage navigation', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: 'Posts' }).click()

  await expect(page).toHaveURL('/posts')
  await expect(page.getByRole('heading', { name: 'Posts' })).toBeVisible()
})

test('expands the posts board for desktop while keeping it within a narrow viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/posts')

  const board = page.locator('section[aria-labelledby="posts-title"]')
  const desktopBoard = await board.boundingBox()

  expect(desktopBoard?.width).toBeGreaterThan(1000)

  await page.setViewportSize({ width: 320, height: 900 })

  const narrowBoard = await board.boundingBox()

  expect(narrowBoard?.width).toBeGreaterThan(200)
  expect(narrowBoard?.width).toBeLessThanOrEqual(320)
})
