import { Locator, Page } from '@playwright/test'
import { OrderPage } from './order-page'
import { SERVICE_URL } from '../../config/env-data'

export class LoginPage {
  readonly page: Page
  readonly url: string = SERVICE_URL
  readonly signInButton: Locator
  readonly usernameField: Locator
  readonly passwordField: Locator
  readonly authError: Locator
  // add more locators here

  constructor(page: Page) {
    this.page = page
    this.signInButton = page.getByTestId('signIn-button')
    this.usernameField = page.getByTestId('username-input')
    this.passwordField = page.getByTestId('password-input')
    this.authError = page.getByTestId('authorizationError-popup')
    // continue with the rest of the implementation below
  }

  async open() {
    await this.page.goto(this.url)
  }

  async signIn(username: string, password: string) {
    await this.usernameField.fill(username)
    await this.passwordField.fill(password)
    await this.signInButton.click()
    return new OrderPage(this.page)
  }

  // continue with the rest of the implementation below
}
