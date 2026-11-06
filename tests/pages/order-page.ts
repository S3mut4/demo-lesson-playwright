import { Locator, Page } from '@playwright/test'

export class OrderPage {
  readonly page: Page
  readonly statusButton: Locator
  readonly usernameInput: Locator
  readonly phoneInput: Locator
  readonly commentInput: Locator
  readonly createOrderButton: Locator
  readonly successMessage: Locator
  readonly customerNameError: Locator
  readonly phoneError: Locator
  readonly logoutButton: Locator
  readonly signInButton: Locator
  readonly searchOrderButton: Locator
  readonly searchOrderInput: Locator
  readonly orderNotFoundText: Locator
  readonly orderNotFoundImage: Locator
  readonly serverErrorDescription: Locator
  readonly orderNameDetails: Locator
  readonly orderStatusOpen: Locator

  constructor(page: Page) {
    this.page = page
    this.statusButton = page.getByTestId('openStatusPopup-button')
    this.usernameInput = page.getByTestId('username-input')
    this.phoneInput = page.getByTestId('phone-input')
    this.commentInput = page.getByTestId('comment-input')
    this.createOrderButton = page.getByTestId('createOrder-button')
    this.successMessage = page.getByTestId('orderSuccessfullyCreated-popup')
    this.customerNameError = page.getByTestId('username-input-error')
    this.phoneError = page.getByTestId('phone-input-error')
    this.logoutButton = page.getByTestId('logout-button')
    this.signInButton = page.getByTestId('login-button')
    // order status
    this.searchOrderButton = page.getByTestId('searchOrder-submitButton')
    this.searchOrderInput = page.getByTestId('searchOrder-input')
    this.orderNotFoundText = page.getByTestId('orderNotFound-title')
    this.orderNotFoundImage = page.getByTestId('orderNotFound-image')
    this.serverErrorDescription = page.getByTestId('serverError-description')
    // order exist
    this.orderNameDetails = page.getByTestId('order-item-0')
    this.orderStatusOpen = page.getByTestId('status-item-0')
  }
}
