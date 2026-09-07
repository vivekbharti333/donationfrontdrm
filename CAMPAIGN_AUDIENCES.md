# Campaign audiences

## Enable the change

1. Run `db/campaign-audiences.sql` from the backend repository against the application's MySQL database. The script creates audience membership and recipient tracking tables and upgrades the earlier recipient scaffold. It does not delete contacts or messages.
2. Build/restart the backend, then rebuild/refresh Angular. The new endpoints require the authenticated user's token.
3. In **Contact Directory**, choose an existing audience or enter a new audience name before uploading Excel. Create an audience first when adding contacts manually or assigning existing contacts. Select directory contacts using the table checkboxes and click **Add selected contacts to audience**.
4. In **Send Campaign**, choose an existing audience, select individual/all/filtered contacts, choose channel, campaign name, WhatsApp template if applicable, then review and send. Contact creation, imports, and assignment are only in Contact Directory.

Excel upload creates a named audience or adds members to the selected existing audience. It never replaces a list. Duplicate contacts found by email/mobile are linked rather than duplicated. Excel columns remain: Name, Mobile, Alternate number, Email, Company/NGO, Address, City, Lead source, with a header row.
## Selection and history

- **All contacts in this audience** is limited to the selected list. **Select all filtered contacts** selects only the current search results. Angular submits an explicit snapshot of the chosen contact IDs.
- The server verifies audience membership, contact ownership, campaign ownership, channel compatibility, and contact eligibility.
- **Not yet sent in this campaign** excludes previously accepted, queued, and unknown-result attempts across all audiences in that campaign. Failed attempts can be retried. Unchecking it explicitly permits resending previously accepted messages; concurrent pending attempts remain excluded.
- Campaign reservations use a database lock on the campaign to prevent concurrent requests from queuing the same contact twice. Recipients are recorded before provider calls.
- Recipient logs retain campaign/report, audience, contact, channel, template, timestamps, errors, and the local WhatsApp message ID. WhatsApp delivery/read events continue to live in `WhatsAppMessage`; a recipient marked `SENT` means provider acceptance, not confirmed delivery.
- `UNKNOWN` means a provider request was interrupted and acceptance could not be determined. Check provider/message history before explicitly resending it. Pending records after a server interruption are not automatically resent.
- Historical sends made before recipient tracking was added are **not backfilled** because the old aggregate campaign logs cannot reliably identify every recipient. The duplicate-send filter applies to the new recipient records.

WhatsApp uses the existing template sender. Email uses the existing `AwsSes` sender. SMS campaign sending is not configured, so the UI disables it and the API rejects it instead of returning a false success.

## Architecture and verification

Audience management follows `AudienceController → AudienceServices → AudienceHelper → AudienceDao/ContactAudienceDao`. Sending remains in `CampaignReportController → CampaignReportServices`, using `CampaignRecipientHelper → CampaignRecipientDao` for scope checks and logs. Existing contact, Excel, email, and WhatsApp helpers are reused.

Backend regression tests use an isolated H2 database and never call messaging providers:

```powershell
$env:JAVA_TOOL_OPTIONS = '-Dfile.encoding=UTF-8'
mvn -Pcampaign-tests -Dtest=AudienceCampaignTest test
```

The `campaign-tests` profile uses `target-campaign-tests` so it does not compete with IDE builds in `target`. A pre-existing oversized Java image literal was split with `String.join` without changing the encoded image data to allow a full compile.

Frontend verification: `npx ng build --configuration development`.
