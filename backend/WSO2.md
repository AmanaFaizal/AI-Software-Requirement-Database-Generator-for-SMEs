# WSO2 API integration

Implemented locally: opt-in dual-token transport, JWT validation, inventory ownership regression tests, and an OpenAPI definition covering all 36 backend operations under 12 feature tags. A separate live run verified all 36 operations through the deployed gateway and MySQL using Publisher Internal-Key. OAuth subscription validation and throttling remain unverified; unit tests alone do not prove them.

## Authentication boundary

Default `BIZGUIDE_AUTH_MODE=direct` keeps the existing React client working with `Authorization: Bearer <BizGuide JWT>`. A custom identity header in direct mode is rejected to prevent ambiguous credentials.

For a local gateway demo, run `npm.cmd run start:gateway` from backend. This explicitly selects gateway mode even when the terminal has an inherited direct-mode variable. Every protected route requires `X-BizGuide-Token: Bearer <BizGuide JWT>`. The backend does not use Authorization as user identity; WSO2 validates the OAuth token separately. There is no fallback between modes. The existing React client needs direct mode; stop the gateway backend and run with `BIZGUIDE_AUTH_MODE=direct` to use it.

The custom header alone does not prove a request passed through WSO2. Restrict backend network access to the gateway if gateway enforcement is mandatory; use HTTPS beyond local development. Do not use forwarded user IDs as identity. Do not put OAuth client secrets in React.

## Deploy the complete API definition

1. Keep backend endpoint `http://localhost:5000`, API context `/bizguide`, version `1.0.0`.
2. Merge/import `openapi/wso2-inventory.json` into the existing Publisher API. It includes Authentication, Businesses, Products, Categories, Dealers, Purchases, Invoices, Sales, Expenses, Reminders, Reports and Health. Tags group the operations; all 36 method/path combinations remain explicit gateway resources. Remove broad wildcard resources from the deployed definition. Deploy a new revision after updating the definition.
3. Keep OAuth security enabled on all resources, including registration, login and health. A valid WSO2 subscription and token are required even though the backend registration/login/health routes do not require a BizGuide JWT.
4. Confirm the gateway forwards `X-BizGuide-Token` unchanged. The definition exposes it as a required header parameter on protected routes, so Try Out has an editable field. Paste `Bearer <login JWT>` there. Do not configure it as the gateway's OAuth authorization header. Publisher's Internal-Key authenticates only to the gateway; it does not replace the login JWT.
5. Save, create a new revision, and deploy it to Default Gateway. Editing resources alone does not verify deployment.
6. Obtain a BizGuide JWT from login, then list businesses to obtain an owned business ID. Use Postman secret variables for credentials and tokens.

Gateway request in Postman:

```text
GET https://localhost:8243/bizguide/1.0.0/api/businesses/{{businessId}}/products
Authorization: Bearer {{wso2AccessToken}}
X-BizGuide-Token: Bearer {{bizguideJwt}}
```

Expected: 200 only for an owned business with valid credentials. Verify missing/invalid OAuth is rejected at WSO2; valid OAuth without a BizGuide JWT receives backend 401; invalid/expired BizGuide JWT receives 401; another user's business receives 404. Capture redacted response evidence and verify custom-header forwarding before claiming gateway integration works.

## Validation and remaining work

Run `npm.cmd test` from backend on Windows. Tests exercise middleware validation and controller ownership using model stubs; they do not connect to MySQL or WSO2. No live credentials are needed.

The OpenAPI coverage test also compares the mounted routes and checks explicit user-token header inputs. For live checks, configure `WSO2_ACCESS_TOKEN` in `.env` and run `npm.cmd run verify:gateway`. For a local self-signed WSO2 certificate, use `WSO2_ALLOW_SELF_SIGNED=true` only on loopback, or configure certificate trust. The runner creates test data and saves a redacted status report. See [the project guide](../docs/WSO2-PROJECT.md) for setup, evidence and limits, and [the article](../docs/WSO2-BLOG.md) for publication preparation.

The definition includes write operations. Validate writes using disposable data and verify ownership and input validation before production use. Configure and demonstrate throttling separately. Frontend OAuth integration, monitoring, live token rotation and deployment are remaining operational work.
