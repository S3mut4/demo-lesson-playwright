import { Locator, Page } from '@playwright/test'

export class OrderPage {
  readonly page: Page
  readonly statusButton: Locator
  readonly usernameInput: Locator
  readonly phoneInput: Locator
  readonly commentInput: Locator
  readonly createOrderButton: Locator
  readonly successMessage: Locator
  // add more locators here

  constructor(page: Page) {
    this.page = page
    this.statusButton = page.getByTestId('openStatusPopup-button')
    this.usernameInput = page.getByTestId('username-input')
    this.phoneInput = page.getByTestId('phone-input')
    this.commentInput = page.getByTestId('comment-input')
    this.createOrderButton = page.getByTestId('createOrder-button')
    this.successMessage = page.getByTestId('orderSuccessfullyCreated-popup')
  }
}
