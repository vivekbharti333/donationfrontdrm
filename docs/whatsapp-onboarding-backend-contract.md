# WhatsApp onboarding deployment

The frontend and backend use Graph API v24.0. The frontend calls `/api/whatsapp/exchange-code`; `addWhatsDetails` is now a compatibility entry point for the same verified flow, with request data inside `payload`. Neither endpoint accepts a browser-supplied tenant ID or raw access token as proof of ownership. The retired root `exchange-code` and `exchangeClientCode` routes return HTTP 410.

## Required before deploying the backend

1. Back up `whats_app_details`, resolve any existing duplicate non-null `superadmin_id` or `phone_number_id` rows, and apply `db/whatsapp-onboarding.sql` once. The migration adds metadata/provisioning columns and unique indexes. It has not been run on your database by this change.
2. Configure the backend environment (or JVM system properties):
   - `FACEBOOK_APP_SECRET`: the secret for app 1222137563317496.
   - `WHATSAPP_TOKEN_ENCRYPTION_KEY`: Base64 encoding of 32 cryptographically random bytes. Keep it stable, backed up and protected. Changing or losing it makes stored encrypted credentials unreadable. Never commit it or send it to the frontend.
   - `WHATSAPP_WEBHOOK_VERIFY_TOKEN`: the exact verification token configured for your Meta webhook. Replace the former hardcoded token in Meta's dashboard with this configured value.
3. Configure Meta's app webhook to your deployed HTTPS `/whatsAppWebhook` URL, subscribe to messages, and verify it. POST requests now require a valid `X-Hub-Signature-256` using `FACEBOOK_APP_SECRET`; invalid requests return 403. Processing failures return 500 so Meta can retry.
4. Verify the Meta app is live, required business/messaging permissions have Advanced Access for external clients, and the production HTTPS domains and redirect configuration are allowed. Login configuration 4471781046413650 must belong to this app and standard verified-phone Embedded Signup. CORS allows localhost:4200, https://donexia.in and https://www.donexia.in; add the exact frontend origin if hosting elsewhere.
5. Configure and approve `donation_receipt_global` in each client's own WABA, with English language code `en` and the four positional body parameters used by the existing receipt sender (donor name, amount, organisation, receipt URL). Existing automatic receipts need the client's invoice WhatsApp setting `INDIVITUAL` to use their own identity. GLOBAL continues to mean the shared/global sender. Onboarding does not create or approve receipt templates or modify billing/receipt preferences.

## What is saved

The authenticated user determines the client (`superadminId`). Administrators (MAINADMIN, SUPERADMIN, ADMIN) can connect/disconnect/test; active authenticated client users can read status and use their own messaging configuration. The saved record contains client owner, business ID, WABA ID, phone ID, display phone number, WABA/business name, display name/approval status, Graph version, provider/type, encrypted token and registration PIN, token expiry when Meta supplies it, provisioning state, signup attempt and timestamps. Meta supplies the authoritative account fields, not the browser.

Phone registration and WABA webhook subscription complete before status becomes ACTIVE. Credentials and the registration PIN are saved as PENDING before remote provisioning, allowing recovery after partial failure. Reconnect after three minutes to retry an incomplete setup; the saved PIN is reused unless the user supplies their existing PIN. A completed or newer/disconnected signup cannot be overwritten by an older completion. Unique database indexes prevent concurrent assignment of one phone to multiple clients.

The encryption converter reads existing plaintext tokens for compatibility and encrypts them on their next save. Plan a controlled rewrite of remaining legacy rows after deployment if full historical encryption is required. Tokens and PINs are excluded from entity JSON and Lombok string output. Disconnect disables sending locally and removes the token; it deliberately does not deregister the phone or unsubscribe an entire shared WABA.

Inbox queries, reply sends, media uploads/downloads and template-message sends resolve the authenticated client's phone. The old global fallback is removed from those interactive paths. Webhook processing remains server-side and maps messages to phone IDs; the inbox filters by the client's stored phone ID.

## Frontend API contract

POST `/api/whatsapp/exchange-code`:

```json
{"code":"single-use authorization code","wabaId":"456","phoneNumberId":"123","businessId":"789","signupEvent":"FINISH","graphApiVersion":"v24.0"}
```

`businessId` may be null when Meta does not supply it. The server resolves it from the WABA owner. `registrationPin` is an optional six-digit string for an existing two-step verification PIN. The backend ignores browser tenant/version fields and pins all its requests to v24.0. A supplied business ID must match Meta's WABA owner; the token must grant the selected WABA and the selected phone must belong to it.

A successful response is HTTP 200 with `connected:true` and the persisted selected IDs and display fields. GET `/api/whatsapp/status` returns `connected:false` for no connection and `setupPending:true` for incomplete setup. The frontend blocks another signup after an uncertain response until status is checked. POST `/api/whatsapp/disconnect` confirms durable `connected:false`. POST `/api/whatsapp/send-test` accepts `recipient` in international digits and uses the approved receipt template; it returns Meta's accepted `messageId`. Acceptance is not delivery confirmation. The example test receipt uses test donor/amount and https://donexia.in as its sample receipt link.

For `addWhatsDetails`, wrap the exchange request in `{"payload":{...}}`. Old requests with raw credentials must migrate to verified signup. The new compatibility route returns the same safe connection response as the onboarding endpoint.

## Validation and limits

Frontend tests cover SDK v24 initialization, script loading timeout, both signup callback orders, spoofed origins, duplicate attempts, cancellation, missing details, wrong-account responses, save failure/status reconciliation, recipient validation, message acceptance, existing PINs, partial setup and disconnect confirmation. Backend tests use mock Meta responses and an in-memory H2 database to check selected account grants, durable metadata/encrypted secrets, partial provisioning, authenticated ownership, cross-client phone rejection and webhook signature validation.

No real client has been onboarded by these tests. Run a pilot with two independent clients after migration/configuration: signup, saved details after refresh, accepted and delivered receipt, incoming reply, inbox/client isolation, disconnect/reconnect, pending setup recovery and expired/revoked authorization. Business App coexistence, WABA-only signup, explicit number migration and automatic creation/approval of templates require separate configured flows; this implementation supports standard FINISH signup with a verified phone.

Focused frontend command:

```
npm test -- --watch=false --browsers=ChromeHeadless --ts-config=tsconfig.whatsapp-spec.json --include=src/app/core-component/whats-app-management/whats-app-integration/*.spec.ts
```

Backend regression classes: `com.common.helper.WhatsAppOnboardingTest` and `com.common.helper.WhatsAppOnboardingPersistenceTest`. Maven is not on PATH on this workstation; changed Java classes and these tests were compiled with Java 17 and cached project dependencies. A full WAR build is still required in your normal backend deployment environment.
