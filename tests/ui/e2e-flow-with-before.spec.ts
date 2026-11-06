import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { faker } from '@faker-js/faker/locale/en'
import { PASSWORD, USERNAME } from '../../config/env-data'

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
  // let's create an order
  await orderCreationPage.usernameInput.fill('random-user')
  await orderCreationPage.phoneInput.fill('55665544')
  await orderCreationPage.commentInput.fill('leave near the door')
  await orderCreationPage.createOrderButton.click()
  // now verify success message
  await expect(orderCreationPage.successMessage).toBeVisible()
})

test('check errors on order creation', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  // let's create an order
  await orderCreationPage.usernameInput.fill('a')
  await orderCreationPage.phoneInput.fill('12345')
  await orderCreationPage.commentInput.fill('leave near the door')
  //Check
  await expect(orderCreationPage.createOrderButton).toBeDisabled()
  // now verify errors messages
  await expect(orderCreationPage.phoneError).toBeVisible()
  await expect(orderCreationPage.customerNameError).toBeVisible()
})

test.only('logout from order page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.logoutButton.click()
  //Check
  await expect(loginPage.signInButton).toBeVisible()
  await expect(orderCreationPage.logoutButton).toBeHidden()
  // URL
  // Not good: expect(loginPage.url).toContain('signin')
  // We have iun login-page --> readonly url: string = SERVICE_URL
  // console.log(loginPage.page.url())
  expect(loginPage.page.url()).toContain('signin')
})

test('order not found page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.statusButton.click()
  //fill order
  await orderCreationPage.searchOrderInput.fill('25000')
  await orderCreationPage.searchOrderButton.click()
  //Check
  await expect(orderCreationPage.orderNotFoundText).toBeVisible()
  await expect(orderCreationPage.orderNotFoundImage).toBeVisible()
  //await expect(orderCreationPage.serverErrorDescription).toBeVisible()
  //await expect(orderCreationPage.serverErrorDescription).toHaveText('Please retry your request later')
})

test('order found page', async ({}) => {
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.statusButton.click()
  //fill order
  await orderCreationPage.searchOrderInput.fill('20616')
  await orderCreationPage.searchOrderButton.click()
  //Check
  await expect(orderCreationPage.orderStatusOpen).toBeVisible()
  await expect(orderCreationPage.orderNameDetails).toBeVisible()
})