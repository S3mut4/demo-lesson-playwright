import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { faker } from '@faker-js/faker/locale/en'
import { PASSWORD, USERNAME } from '../../config/env-data'
import { existingOrderMock, nonExistingOrderMock, serverErrorOrderMock } from '../mock/order-mocks'

let loginPage: LoginPage

test.beforeEach(async ({ page }) => {
  loginPage = new LoginPage(page)
  await loginPage.open()
})

test('signIn button disabled when incorrect data inserted', async ({}) => {
  await loginPage.usernameField.fill(faker.lorem.word(2))
  await loginPage.passwordField.fill(faker.lorem.word(7))
  await expect(loginPage.signInButton).toBeDisabled()
})

test('error message displayed when incorrect credentials used', async ({}) => {
  await loginPage.usernameField.fill(faker.lorem.word(2))
  await loginPage.passwordField.fill(faker.lorem.word(9))
  await loginPage.signInButton.click()
  await expect(loginPage.authError).toBeVisible()
})

test('login with correct credentials and verify order creation page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await expect(orderCreationPage.statusButton).toBeVisible()
  await expect(orderCreationPage.usernameInput).toBeVisible()
  await expect(orderCreationPage.phoneInput).toBeVisible()
  await expect(orderCreationPage.commentInput).toBeVisible()
  await expect(orderCreationPage.createOrderButton).toBeVisible()
})

test('login and create order', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  // create an order
  await orderCreationPage.usernameInput.fill('random-user')
  await orderCreationPage.phoneInput.fill('55665544')
  await orderCreationPage.commentInput.fill('leave near the door')
  await orderCreationPage.createOrderButton.click()
  // verify success message
  await expect(orderCreationPage.successMessage).toBeVisible()
})

test('check errors on order creation', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  // fill the form with invalid data
  await orderCreationPage.usernameInput.fill('a')
  await orderCreationPage.phoneInput.fill('12345')
  await orderCreationPage.commentInput.fill('leave near the door')
  // checks
  await expect(orderCreationPage.createOrderButton).toBeDisabled()
  await expect(orderCreationPage.phoneError).toBeVisible()
  await expect(orderCreationPage.customerNameError).toBeVisible()
})

test('logout from order page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.logoutButton.click()
  // checks
  await expect(loginPage.signInButton).toBeVisible()
  await expect(orderCreationPage.logoutButton).toBeHidden()
  await expect(loginPage.page).toHaveURL(/signin/)
})

test('order not found page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.statusButton.click()
  // fill order number
  await orderCreationPage.searchOrderInput.fill('25000')
  await orderCreationPage.searchOrderButton.click()
  // checks
  await expect(orderCreationPage.orderNotFoundText).toBeVisible()
  await expect(orderCreationPage.orderNotFoundImage).toBeVisible()
})

test('order found page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.statusButton.click()
  // fill order number
  await orderCreationPage.searchOrderInput.fill('20616')
  await orderCreationPage.searchOrderButton.click()
  // checks
  await expect(orderCreationPage.orderStatusOpen).toBeVisible()
  await expect(orderCreationPage.orderNameDetails).toBeVisible()
})

test('order mock found page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  // NB !!! init mock before flow started
  await existingOrderMock(orderCreationPage.page)
  // search for order
  await orderCreationPage.statusButton.click()
  // fill order number
  await orderCreationPage.searchOrderInput.fill('0') // any value works, the response is mocked
  await orderCreationPage.searchOrderButton.click()
  // checks
  await expect(orderCreationPage.orderStatusOpen).toBeVisible()
  await expect(orderCreationPage.orderNameDetails).toContainText('Mark')
})

test('order mock not found page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  // NB !!! init mock before flow started
  await nonExistingOrderMock(orderCreationPage.page)
  // search for order
  await orderCreationPage.statusButton.click()
  // fill order number
  await orderCreationPage.searchOrderInput.fill('25000') // any value works, the response is mocked
  await orderCreationPage.searchOrderButton.click()
  // checks
  await expect(orderCreationPage.orderNotFoundText).toBeVisible()
  await expect(orderCreationPage.orderNotFoundImage).toBeVisible()
})

test('order mock server side error', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  // NB !!! init mock before flow started
  await serverErrorOrderMock(orderCreationPage.page)
  // search for order
  await orderCreationPage.statusButton.click()
  // fill order number
  await orderCreationPage.searchOrderInput.fill('010') // any value works, the response is mocked
  await orderCreationPage.searchOrderButton.click()
  // checks
  await expect(orderCreationPage.serverErrorDescription).toBeVisible()
  await expect(orderCreationPage.serverErrorDescription).toHaveText(
    'Please retry your request later',
  )
})

test('order mock server side error with empty body', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  // NB !!! init mock before flow started
  await serverErrorOrderMock(orderCreationPage.page)
  // search for order
  await orderCreationPage.statusButton.click()
  await orderCreationPage.searchOrderInput.fill('010') // any value works, the response is mocked
  const responsePromise = orderCreationPage.page.waitForResponse('**/orders/*')
  await orderCreationPage.searchOrderButton.click()
  // checks: the response really comes from the mock
  const response = await responsePromise
  expect(response.status()).toBe(500)
  expect(await response.text()).toBe('')
  // checks: generic error shown, nothing else
  await expect(orderCreationPage.serverErrorDescription).toHaveText(
    'Please retry your request later',
  )
  await expect(orderCreationPage.orderNotFoundText).toBeHidden()
  await expect(orderCreationPage.orderNameDetails).toBeHidden()
})

test('order mock server side error does not leak internal details', async ({}) => {
  const leakedDetails = [
    'ORA-00942: table or view does not exist',
    'at OrderService.findById (/app/src/order-service.ts:42)',
    '/internal/db/orders',
  ]
  const leakyErrorBody = JSON.stringify({
    error: leakedDetails[0],
    stack: leakedDetails[1],
    path: leakedDetails[2],
  })

  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  // NB !!! init mock before flow started
  await serverErrorOrderMock(orderCreationPage.page, leakyErrorBody)
  // search for order
  await orderCreationPage.statusButton.click()
  await orderCreationPage.searchOrderInput.fill('010') // any value works, the response is mocked
  const responsePromise = orderCreationPage.page.waitForResponse('**/orders/*')
  await orderCreationPage.searchOrderButton.click()
  // checks: the response really comes from the mock
  const response = await responsePromise
  expect(response.status()).toBe(500)
  // checks: generic error shown
  await expect(orderCreationPage.serverErrorDescription).toHaveText(
    'Please retry your request later',
  )
  // checks: no internal details rendered anywhere on the page
  for (const detail of leakedDetails) {
    await expect(orderCreationPage.page.locator('body')).not.toContainText(detail)
  }
})
