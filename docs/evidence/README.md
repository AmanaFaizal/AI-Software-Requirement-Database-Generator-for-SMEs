# Verification evidence

Reports were generated locally on 16 November 2026. They contain no passwords,
access tokens, JWTs or full login responses.

| Artifact | What it establishes | Result |
| --- | --- | --- |
| `backend-live.json` | Real HTTP + MySQL workflow covering all 36 operations in direct mode, stock/report assertions and authorization rejection checks | Passed |
| `gateway-mode-backend.json` | Running backend accepts the user-token header in gateway mode and rejects Authorization as the user's credential | Passed: 200 / 401 |
| `gateway-live.json` | All 36 operations through the WSO2 gateway using Publisher Internal-Key, plus credential/ownership rejection checks | Passed: 43 checks; stock/report assertions passed |

Four automated test groups also passed via `npm.cmd test` in backend: JWT
transport separation, inventory ownership rejection, product scoping and exact
OpenAPI route/header coverage.

The user-supplied Publisher screenshot showed a successful gateway login and
protected calls rejected for a missing user JWT. It also exposed tokens, so it
is not copied into the repository or treated as a safe publication artifact.
Retake screenshots with credentials hidden before sharing.

## Reproduce gateway evidence

1. For OAuth verification, add a valid subscribed application's `WSO2_ACCESS_TOKEN` to `backend/.env`. The completed run instead used `WSO2_INTERNAL_KEY` from Publisher. Keep credentials private; refresh an expired key in Publisher.
2. Ensure the latest OpenAPI definition is imported and its revision deployed.
3. Keep the backend running with `npm.cmd run start:gateway`.
4. Set `WSO2_ALLOW_SELF_SIGNED=true` only for the loopback development certificate, or configure trust.
5. Run `npm.cmd run verify:gateway` from backend.
6. Check that `gateway-live.json` reports `passed: true` and `coveredOperations: 36`. If it fails, fix the reported request before presenting the project as fully verified.

The runner creates disposable test accounts and transactions. It does not erase
existing business data; generated accounts and financial records remain in the
test database. Backend fixture business 3 came from the completed direct run.

## Suggested 3–5 minute demonstration

1. Explain BizGuide's SME workflow and the gateway/backend/database architecture.
2. Show the published API and deployed revision in Publisher.
3. Demonstrate missing gateway credentials returning 401.
4. Log in through the gateway, hide the returned JWT, then call `/api/auth/me`
   and list inventory with both credentials.
5. Demonstrate missing user JWT and another user's access being rejected.
6. Show the redacted live report and explain the current limitations.

Do not claim frontend OAuth or production deployment: neither is implemented
by this integration. WSO2 decides the eligibility of submitted evidence.

The completed gateway run retained fixture business 5. Developer Portal OAuth subscription validation and rate limiting are not established by this Internal-Key run.
