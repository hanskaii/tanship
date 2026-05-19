## ADDED Requirements

### Requirement: `purchase:initiate` permission is defined for applicable roles

The permission `purchase:initiate` SHALL be added to `ROLE_PERMISSIONS` in `config/permissions.ts` for the `user` role. This represents the capability to start a checkout session.

#### Scenario: User role has purchase initiate permission

- **WHEN** `ROLE_PERMISSIONS` is read for the `user` role
- **THEN** `purchase:initiate` is present in the permissions array

### Requirement: `license:activate` permission is defined for applicable roles

The permission `license:activate` SHALL be added to `ROLE_PERMISSIONS` in `config/permissions.ts` for the `user` role. This represents the capability to activate an owned license key.

#### Scenario: User role has license activate permission

- **WHEN** `ROLE_PERMISSIONS` is read for the `user` role
- **THEN** `license:activate` is present in the permissions array

### Requirement: `purchase.initiate` Gate policy enforces role capability

A Gate policy SHALL be defined for the action `purchase.initiate` using `authorize("purchase:initiate")`. The policy MUST be pure — no DB queries inside the policy function.

#### Scenario: User with correct role can initiate purchase

- **WHEN** `Gate.can("purchase.initiate", { actor: user })` is called for a user with `user` role
- **THEN** the result is `{ allowed: true }`

#### Scenario: Banned or suspended user cannot initiate purchase

- **WHEN** `Gate.can("purchase.initiate", { actor: bannedUser })` is called
- **THEN** the policy denies (via `authorize()` propagating role mismatch or admin bypass)

### Requirement: `license.activate` Gate policy enforces ownership

A Gate policy SHALL be defined for the action `license.activate` using `combine(authorize("license:activate"), ownershipCheck)`. The ownership check SHALL verify `ctx.actor.id === ctx.resource.userId` where `resource.userId` is the userId stored on the purchase record. The policy MUST be pure — the caller fetches the purchase row and passes `resource.userId`.

#### Scenario: User activates their own license

- **WHEN** `Gate.can("license.activate", { actor: user, resource: { userId: user.id } })` is called
- **THEN** the result is `{ allowed: true }`

#### Scenario: User attempts to activate another user's license

- **WHEN** `Gate.can("license.activate", { actor: user, resource: { userId: "different-user-id" } })` is called
- **THEN** the result is `{ allowed: false }` with message "Not your license"

### Requirement: Both policies are registered in `config/index.ts`

The `GateActions` interface SHALL be extended with `"purchase.initiate"` and `"license.activate"` via `InferPolicyActions`. Both policies SHALL be registered in `Gate.policies({...})`.

#### Scenario: Gate recognises both new actions

- **WHEN** `Gate.can("purchase.initiate", ctx)` is called
- **THEN** the policy resolves without a "no policy registered" error

#### Scenario: Gate recognises license activate action

- **WHEN** `Gate.can("license.activate", ctx)` is called
- **THEN** the policy resolves without a "no policy registered" error
