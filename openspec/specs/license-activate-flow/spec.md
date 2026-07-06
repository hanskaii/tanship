# Spec: license-activate-flow

### Requirement: Authenticated user can activate a license key

An authenticated user on `/activate` SHALL be able to enter a license key, validate it, and activate it. Validation SHALL confirm the key exists in the `purchases` table and belongs to the current user. Activation SHALL call the existing `/api/github/activate` endpoint with the license key and GitHub username.

#### Scenario: Authenticated user activates a valid key

- **WHEN** a logged-in user navigates to `/activate`
- **THEN** a form is shown to enter their license key
- **WHEN** the user submits a valid license key that belongs to them
- **THEN** the system validates the key against their purchases
- **THEN** the user is prompted to enter their GitHub username (for boilerplate access)
- **THEN** on submission, the GitHub invitation is sent and the purchase is marked as claimed

#### Scenario: Authenticated user enters invalid license key

- **WHEN** a logged-in user submits a license key that does not exist or belongs to another user
- **THEN** an error message is shown: "Invalid license key or not associated with your account"
- **THEN** the form remains active for re-entry

#### Scenario: Already-activated license key

- **WHEN** a logged-in user submits a license key that has already been activated (githubInvitedAt is set)
- **THEN** an informational message is shown: "This license is already activated"
- **THEN** the GitHub username that claimed it is displayed

### Requirement: Guest user who lands on `/activate` after purchase is prompted to authenticate

When a guest buyer is redirected to `/activate` by DodoPay (with `?licenseKey=xxx` in the URL), the page SHALL detect the unauthenticated state, store the license key in session storage, and redirect the user to the login/register page. After successful authentication, the user SHALL be returned to `/activate` and the pending license key SHALL be auto-populated and activation initiated automatically.

#### Scenario: Guest lands on /activate with license key param

- **WHEN** an unauthenticated user navigates to `/activate?licenseKey=XXXX-XXXX-XXXX`
- **THEN** the page reads the `licenseKey` query param
- **THEN** the key is saved to `sessionStorage` under the key `pendingLicenseKey`
- **THEN** the user is redirected to `/login?redirect=/activate`

#### Scenario: Guest completes login and is returned to /activate

- **WHEN** the user completes login/registration after the above redirect
- **THEN** the user is returned to `/activate`
- **THEN** the page reads `pendingLicenseKey` from session storage
- **THEN** the license key field is pre-populated with the stored key
- **THEN** the system auto-validates the key against the now-authenticated user's purchases
- **THEN** `pendingLicenseKey` is cleared from session storage after successful read

#### Scenario: Guest logs in but pending key does not belong to their account

- **WHEN** a user returns to `/activate` with a pending key that was purchased under a different account
- **THEN** an error is shown: "This license key is not associated with your account"
- **THEN** the user can manually enter a different key

### Requirement: Activation success shows confirmation

After successful activation, the page SHALL display a success state showing: the plan name activated, the GitHub username that was invited, and a link to the billing page to view all purchases.

#### Scenario: Activation success state

- **WHEN** activation completes successfully
- **THEN** the form is replaced with a success message
- **THEN** the user sees "License activated! GitHub invitation sent to @username"
- **THEN** a link to `/account/billing` is shown
