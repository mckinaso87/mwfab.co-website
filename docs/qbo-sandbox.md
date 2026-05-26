# QuickBooks Online — Sandbox Testing Checklist

Phase-1 integration testing against the Intuit sandbox. Run migration `014_qbo_integration.sql` on your Supabase project before testing.

## 1. Environment setup

Add to `.env.local`:

```env
QBO_CLIENT_ID=
QBO_CLIENT_SECRET=
QBO_REDIRECT_URI=http://localhost:3000/api/qbo/callback
QBO_ENVIRONMENT=sandbox
QBO_TOKEN_ENCRYPTION_KEY=   # openssl rand -base64 32
QBO_DEFAULT_ITEM_ID=        # Service item Id from sandbox company
QBO_LINE_TAX_CODE=TAX      # US lines: TAX or NON (not numeric TaxCode Ids)
```

Generate encryption key:

```bash
openssl rand -base64 32
```

In the [Intuit Developer Portal](https://developer.intuit.com/):

1. Create / open your app and enable **Accounting** scope.
2. Add redirect URI `http://localhost:3000/api/qbo/callback` (and production URL when deployed).
3. Open the sandbox company and note the **Realm ID**.

### Find default Item and TaxCode IDs

After OAuth connect (step 2), query via browser or a script using your access token:

- Items: `GET .../v3/company/{realmId}/query?query=select Id, Name from Item where Type = 'Service'`
- Tax codes: `GET .../v3/company/{realmId}/query?query=select Id, Name from TaxCode`

Create a Service item named **Fabrication – General** if none exists.

## 2. Create a sandbox company (required)

If Intuit shows **"There is no sandbox companies found for the user"**, your login has no sandbox company.

1. Go to [Sandbox companies](https://developer.intuit.com/app/developer/sandbox) (Developer Portal → **My Hub** → **Sandboxes**).
2. Click **Add** / **Create** → choose **QuickBooks Online** sandbox (e.g. Plus).
3. Note the **sandbox test user** email/password Intuit shows (or use your developer Intuit login if linked).
4. Optional: open [app.sandbox.qbo.intuit.com](https://app.sandbox.qbo.intuit.com) and sign in once to activate the company.
5. Retry **Connect QuickBooks** in admin — use the account that owns that sandbox.

**Common mistake:** Signing in with a normal QuickBooks Online (production/trial) account while using **Development** Client ID / `QBO_ENVIRONMENT=sandbox`. Development keys only work with portal-provisioned **sandbox** companies.

## 3. OAuth connect

- [ ] Open `/admin/settings/integrations`
- [ ] Click **Connect QuickBooks** → Intuit login → authorize
- [ ] Redirect back with `?connected=1`
- [ ] Verify row in `qbo_connections` (tokens encrypted)
- [ ] Click **Disconnect** → row removed
- [ ] Reconnect successfully

## 4. Customer push (non-blocking)

- [ ] With QBO connected, create customer in `/admin/customers/new`
- [ ] Local save succeeds immediately (redirect to list)
- [ ] Customer appears in QBO sandbox within a few seconds
- [ ] `customers.qbo_customer_id`, `qbo_synced_at` populated; `qbo_sync_error` null
- [ ] Update phone/address → QBO customer updates; `qbo_sync_token` changes
- [ ] QBO badge shows **Synced to QBO** on list and detail
- [ ] Submit public contact form → customer upsert + QBO sync (if connected)

## 5. Customer sync failures

- [ ] Disconnect QBO → save customer locally still succeeds
- [ ] Badge shows **QBO not connected** (no blocking error on save)
- [ ] Reconnect → edit customer → sync recovers

## 6. Estimate push

- [ ] Job with takeoff lines (metal, component, misc, field) + totals saved
- [ ] Open `/admin/jobs/{id}/proposal`
- [ ] Click **Push estimate to QuickBooks**
- [ ] Estimate created in QBO with line descriptions matching takeoff
- [ ] `proposals` anchor row has `qbo_estimate_id`, `qbo_synced_at`
- [ ] **Open in QuickBooks** link works
- [ ] Re-push updates same estimate (same `qbo_estimate_id`)

## 7. Estimate push failures

- [ ] Missing `QBO_DEFAULT_ITEM_ID` → button disabled with message
- [ ] Customer without QBO link → push attempts sync first or returns clear error
- [ ] Invalid tax code id → error shown on form; takeoff data unchanged

## 8. Out of scope (phase 2)

- Webhooks, payments, QBO → local sync, item catalog sync
