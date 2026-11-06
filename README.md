# Test Automation Template

This project is a Test Automation Template designed for the course at Tallinn Learning School. It is intended for learning and practicing:

- The Page Object Pattern.
- Writing End-to-End (E2E) Tests.
- Using Mocks with Playwright.

## Configuration Instructions

### Step 1: Create the env file

Copy the provided `prod.env.example` file to `prod.env` in the root directory of the project (keep the example file as a reference).

### Step 2: Fill in the Values

Open the `prod.env` file and fill in the following fields with the required configuration values:

- `TEST_USERNAME`: The username for the service.
- `TEST_PASSWORD`: The password for the service.
- `URL`: The base URL for the service.

Example:

```
TEST_USERNAME=myUsername
TEST_PASSWORD=myPassword
URL=https://example.com
```

`prod.env` is listed in `.gitignore` and must never be committed.

## Running the tests

```bash
npm install
npx playwright install chromium
npx playwright test
```

Only Chromium is enabled in `playwright.config.ts`. Firefox and WebKit are commented out.

## Lesson 16 — First E2E flow and CI

Covered in `tests/ui/e2e-flow-simple.spec.ts`:

| Test                                                          | Expected result                       |
|---------------------------------------------------------------|---------------------------------------|
| signIn button disabled when incorrect data inserted           | Sign-in button stays disabled         |
| signIn with invalid credentials should lead to error          | Error message is displayed            |
| login with correct credentials and verify order creation page | User lands on the order creation page |

CI (GitHub Actions):

- Workflow file: `.github/workflows/playwright.yml`.
- Credentials are stored as repository secrets (Settings → Secrets and variables → Actions): `URL`, `TEST_USERNAME`, `TEST_PASSWORD`.
- The workflow injects them as environment variables in the test step:

```yaml
- name: Run Playwright tests
  env:
    URL: ${{ secrets.URL }}
    TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
  run: npx playwright test
```

## Lesson 17 — Hooks, order page and code quality in CI

### Tests with `beforeEach`

Covered in `tests/ui/e2e-flow-with-before.spec.ts`. Common setup (opening the page, logging in) is moved into a `beforeEach` hook so each test starts from a known state.

| Test                                                          | Expected result                       |
|---------------------------------------------------------------|---------------------------------------|
| signIn button disabled when incorrect data inserted           | Sign-in button stays disabled         |
| error message displayed when incorrect credentials used       | Error message is displayed            |
| login with correct credentials and verify order creation page | Order creation page is displayed      |
| login and create order                                        | Success popup is displayed            |
| check errors on order creation                                | Field validation errors are displayed |
| logout from order page                                        | User returns to the login page        |
| order not found page                                          | "Not found" page is displayed         |
| order found page                                              | Order details are displayed           |

### Page Objects

- `OrderPage`: locators for the order form (username, phone, comment), the create-order button, the success popup, field errors and the status popup button.
- Locators use `getByTestId`, with `testIdAttribute: 'data-name'` configured in `playwright.config.ts`.

### Assertions used

| Assertion         | Use for                        |
|-------------------|--------------------------------|
| `toHaveValue()`   | Value of an `<input>`          |
| `toHaveText()`    | Exact text of an element       |
| `toContainText()` | Part of the text (more robust) |
| `toBeVisible()`   | Element is shown               |

All locator assertions are async and must be awaited.

### Code quality in CI

The workflow runs, in order:

1. `npm ci`
2. ESLint check
3. Prettier check (`npm run check`)
4. `npx playwright install --with-deps chromium` (only Chromium, to speed up the pipeline)
5. Playwright tests
6. Upload of the HTML report as an artifact

### Dependencies

- Playwright updated 1.56 → 1.65.
- typescript-eslint updated 8.14 → 8.72.
- `npm audit` still reports 6 moderate vulnerabilities: a single `minimatch` issue inherited through typescript-eslint. Waiting for an upstream fix. Do not run `npm audit fix --force` (it downgrades typescript-eslint to 6.x, which does not support TypeScript 5.6).

## Lesson 18 — Mocks with Playwright

### What a mock does

A mock intercepts the requests the browser sends to the backend and returns a predefined response. The page and the UI are real; only the server response is simulated. This makes it possible to test how the frontend reacts to responses that are hard or impossible to reproduce on demand (an existing order, a missing order, a server error).

Mocks are defined in `tests/mock/order-mocks.ts`:

| Mock                   | Simulated response                                                      | Used for               |
|------------------------|-------------------------------------------------------------------------|------------------------|
| `existingOrderMock`    | `200` with an order (`status: OPEN`, `customerName: Mark`, `id: 23999`) | Order details page     |
| `nonExistingOrderMock` | `200` with an empty body                                                | "Order not found" page |
| `serverErrorOrderMock` | `500` with no body                                                      | Server error message   |

All three intercept `**/orders/*`, so any order number typed in the search returns the mocked response.

### How to use a mock

The mock must be registered **before** the action that sends the request:

```typescript
const orderCreationPage = await loginPage.signIn(USERNAME, PASSWORD)
await existingOrderMock(orderCreationPage.page) // register the mock first
await orderCreationPage.statusButton.click()
await orderCreationPage.searchOrderInput.fill('0') // any value works, the response is mocked
await orderCreationPage.searchOrderButton.click()
```

A mock is active only for the `page` it is registered on, so it does not affect other tests.

### Tests

Added to `tests/ui/e2e-flow-with-before.spec.ts`:

| Test                         | Mock                   | Expected result                                  |
|------------------------------|------------------------|--------------------------------------------------|
| order mock found page        | `existingOrderMock`    | Status OPEN shown, customer name contains "Mark" |
| order mock not found page    | `nonExistingOrderMock` | "Not found" text and image displayed             |
| order mock server side error | `serverErrorOrderMock` | "Please retry your request later" displayed      |

### Real data vs mocks

`order found page` and `order not found page` run against real data: they pass only while order `20616` exists and `25000` does not. They are kept as integration checks, but they can fail if the shared data changes. The mocked versions are deterministic and do not depend on the server state.

### Security note

A mock only changes what your own browser receives; the server is not affected. Faking a response (for example a login token) gives no real access if the server validates every request. If a site grants access based only on what the frontend receives, that is a vulnerability in the site (broken access control), not a feature of mocking.