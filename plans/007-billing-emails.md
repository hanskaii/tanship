# Plan 007: Complete Dodo Payments Transactional Email Lifecycle

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md` — unless a reviewer dispatched you and told you they
> maintain the index.
>
> **Drift check (run first)**: `git diff --stat 99272a4..HEAD -- packages/auth/emails/mailer.ts apps/api/src/boot.ts`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `99272a4`, 2026-07-21

## Why this matters

A complete SaaS starter needs robust communication during payment failures, refunds, and subscription updates to maintain transparency and recover failed payments. Currently, the Resend mailer only handles sign-in and purchase confirmations. When payment webhooks like `payment.failed` or `refund.succeeded` fire, the system logs the event but sends no notification to the user. Setting up transactional emails for these events ensures users are notified immediately.

## Current state

- Relevant files:
    - `packages/auth/emails/mailer.ts` — contains the mailer factory returning functions to send emails.
    - `packages/auth/emails/templates/` — folder holding HTML template generators.
    - `apps/api/src/boot.ts` — registers subscribers for `Gate.after` events.

- Existing mailer functions in `packages/auth/emails/mailer.ts`:

    ```ts
    export const createMailer = (env: MailerEnv) => {
        const from = `${env.APP_NAME} <${env.FROM_EMAIL}>`;
        const send = (to: string, subject: string, html: string) =>
            env.SEND_EMAIL.send({ from, to, subject, html });

        return {
            async sendOTP(to: string, otp: string): Promise<void> { ... },
            async sendPurchaseConfirmation(to: string, data: PurchaseConfirmationData): Promise<void> { ... }
        }
    }
    ```

- Webhook handlers emitting events in `packages/auth/hooks/payment.hooks.ts`:
    - `onPaymentFailed`: emits `payment.failed`
    - `onSubscriptionCancelled`: emits `subscription.cancelled`
    - `onRefundSucceeded`: emits `refund.succeeded`

## Commands you will need

| Purpose   | Command                             | Expected on success |
| --------- | ----------------------------------- | ------------------- |
| Build     | `pnpm -F @workspace/auth run build` | exit 0, no errors   |
| Typecheck | `pnpm -F api run build`             | exit 0, no errors   |

## Scope

**In scope**:

- `packages/auth/emails/mailer.ts`
- `packages/auth/emails/templates/subscription-cancelled.ts` (create)
- `packages/auth/emails/templates/payment-failed.ts` (create)
- `packages/auth/emails/templates/refund-succeeded.ts` (create)
- `apps/api/src/boot.ts`

**Out of scope**:

- Changing webhook registration patterns.
- Changing direct database schemas.

## Git workflow

- Branch: `advisor/007-billing-emails`
- Commit message: standard lowercase git message style (e.g. `add billing lifecycle email notifications for cancellations, refunds, and failed payments`)

## Steps

### Step 1: Create Email Templates

Create three email template files in `packages/auth/emails/templates/`:

- `subscription-cancelled.ts`: Inform user their subscription has been cancelled, the reason, and link to re-subscribe on their billing dashboard.
- `payment-failed.ts`: Alert user of a failed payment attempt, notify that access might be suspended, and link to billing portal.
- `refund-succeeded.ts`: Confirm user's refund was successfully processed, and state that repository/organization access has been revoked.

Make sure to match the existing dark HTML template design (using `-apple-system`, geometric layout, `#0a0a0a` background, and clean border radius).

### Step 2: Register Email Methods in Mailer

Open `packages/auth/emails/mailer.ts` and add these methods to the returned object:

- `sendSubscriptionCancelled(to, data)`
- `sendPaymentFailed(to, data)`
- `sendRefundSucceeded(to, data)`

### Step 3: Send Emails on Gate Events

Update `apps/api/src/boot.ts` to trigger these emails when events occur:

- In `Gate.after("subscription.cancelled", ...)`: Look up the user's email, instantiate the mailer, and invoke `sendSubscriptionCancelled`.
- In `Gate.after("refund.succeeded", ...)`: Look up the user's email and invoke `sendRefundSucceeded`.
- Create a `Gate.after("payment.failed", ...)` handler: Look up the user's email using `payload.data?.metadata?.userId` and invoke `sendPaymentFailed`.

**Verify**: `pnpm -F api run build` exits 0.

## Done criteria

- [ ] `pnpm -F api run build` exits 0.
- [ ] Three new template files exist in `packages/auth/emails/templates/`.
- [ ] Mailer supports sending subscription cancelled, payment failed, and refund succeeded notifications.
- [ ] Events in `boot.ts` trigger the new email notifications.

## STOP conditions

- If `env.SEND_EMAIL` is not present during test runs or dev setups, wrap the call in a check: `if (env.SEND_EMAIL) { ... } else { console.log(...) }` to avoid crashing dev and test suites.
