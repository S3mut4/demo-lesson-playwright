import { test, expect } from '@playwright/test'
import { LoginPage } from '../pages/login-page'
import { faker } from '@faker-js/faker/locale/en'
import { PASSWORD, USERNAME } from '../../config/env-data'

test('signIn button disabled when incorrect data inserted', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.open()
  await loginPage.usernameField.fill(faker.lorem.word(2))
  await loginPage.passwordField.fill(faker.lorem.word(7))
  await expect(loginPage.signInButton).toBeDisabled()
})

test('signIn with invalid credentials should lead to error', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.open()
  await loginPage.usernameField.fill(faker.lorem.word(2))
  await loginPage.passwordField.fill(faker.lorem.word(9))

  await loginPage.signInButton.click()

  await expect(loginPage.authError).toBeVisible()
})

test('login with correct credentials and verify order creation page', async ({ page }) => {
  const loginPage = new LoginPage(page)
  await loginPage.open()
  const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
  await orderCreationPage.statusButton.click({ force: true })
  // verify at least few elements on the order creation page
})
