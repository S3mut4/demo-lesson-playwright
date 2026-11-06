import { Page } from '@playwright/test'

export async function existingOrderMock(page: Page) {
  const order = {
    status: 'OPEN',
    courierId: null,
    customerName: 'Mark',
    customerPhone: '55667788',
    comment: 'keep near door',
    id: 23999,
  }

  await page.route('**/orders/*', async (route) => {
    await route.fulfill({
      body: JSON.stringify(order),
    })
  })
}

export async function nonExistingOrderMock(page: Page) {

  await page.route('**/orders/*', async (route) => {
    await route.fulfill({
    })
  })
}

export async function serverErrorOrderMock(page: Page) {
  await page.route('**/orders/*', async (route) => {
    await route.fulfill({
      status: 500,
    })
  })
}
