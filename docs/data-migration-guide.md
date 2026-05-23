# GovDesk BD Data Migration Guide

This project already has the right base structure for moving spreadsheet data into a relational database:

- `Client`: one person or client account.
- `Organization`: businesses owned by a client. One client can have many organizations.
- `Category`: editable service types such as VAT, eReturn, IRC, ERC, Trade License, BIN, TIN.
- `ServiceProfile`: one service account for a client or organization, including portal user ID, password, email, and extra data.
- `ServicePeriod`: monthly or yearly service work, including status, payment, tax amount, print status, and other period-specific information.

## Recommended Spreadsheet Preparation

Before importing, export each Google Sheet tab as CSV or XLSX and normalize these columns:

- Add a stable `Client Name` column wherever possible.
- Add an `Organization Name` column for organization-based services.
- Keep usernames, passwords, email, and email passwords in their existing columns.
- Keep extra unknown columns. They can be stored in `miscellaneousData` or `periodData` JSON.
- Add `Active Status` with values like `Active`, `Inactive`, or `Closed` for old clients.

## VAT Clients Mapping

Create or match:

- `Client.name` from `Name`.
- `Organization.name` if the VAT account belongs to a business. If not, the VAT `ServiceProfile` can be linked directly to `Client`.
- `Category.name = VAT`, `Category.frequency = Monthly`.
- `ServiceProfile.portalUserId` from `User ID`.
- `ServiceProfile.portalEncryptedPassword` from `Password`.
- `ServiceProfile.portalEmail` and `portalEncryptedEmailPassword` if email columns exist.
- `ServiceProfile.miscellaneousData` for extra sheet columns.

Create one `ServicePeriod` per month:

- `period`: `YYYY-MM`, for example `2026-05`.
- `status`: current `SUBMIT STATUS`.
- `paymentAmount`: monthly service charge or paid amount.
- `isPaid`: whether the client paid for this month.
- `periodData.NeedPrint`: `NEED PRINT(YES/NO)`.
- `periodData.VatStatus`: `VAT STATUS`.
- `periodData.LastMonthStatus`: `LAST MONTH STATUS`.
- `periodData.TinNidSyncStatus`: `TIN NID SYNC STATUS`.

Statuses can remain flexible strings for now, so new values can be added without a database migration.

## eReturn Mapping

Create or match:

- `Client.name` from `Name`.
- `Category.name = eReturn`, `Category.frequency = Yearly`.
- `ServiceProfile.portalUserId` from `E-TIN`.
- `ServiceProfile.portalEncryptedPassword` from `Password`.
- `ServiceProfile.portalEmail` from `Email`.
- `ServiceProfile.portalEncryptedEmailPassword` from `Email Password`.

Create one `ServicePeriod` per fiscal year:

- `period`: fiscal year, for example `2024-2025`.
- `status`: submitted, not submitted, under review, rejected, completed, etc.
- `serviceCharge`: service charge for that fiscal year.
- `paymentAmount`: amount paid by the client for that year.
- `isPaid`: current year payment status.
- `periodData.NilSubmitted`: true or false.
- `periodData.TaxPaidAmount`: tax paid amount, if any.
- `periodData.ReturnSubmittedByGovDesk`: true or false.

For “submitted for how many fiscal years”, store each fiscal year as a separate `ServicePeriod`. The count becomes a query instead of a manually maintained column.

## ERC / IRC Mapping

Create or match:

- `Organization.name` from `Organization name`.
- `Category.name = ERC` or `IRC`, `Category.frequency = Yearly`.
- `ServiceProfile.portalUserId` from `userid`.
- `ServiceProfile.portalEncryptedPassword` from `password`.

Create yearly `ServicePeriod` rows for renewal and returns:

- `period`: fiscal year or renewal year.
- `status`: renewed, pending, submitted, not submitted, expired, etc.
- `paymentAmount` and `isPaid`: service payment tracking.
- `periodData.RenewalStatus`: renewal-specific status.
- `periodData.TaxReturnStatus`: yearly tax return status.
- `periodData.VatReturnSummary`: monthly VAT return summary or reference.

If an ERC/IRC client also has monthly VAT work, create a separate VAT `ServiceProfile` for the same `Organization`.

## Inactive or Closed Clients

Create or match the client, then set:

- `Client.isActive = false`.
- `Client.notes`: why service stopped, last contact date, previous service notes.

Keep past services and periods. Do not delete old records, because payment and compliance history remains useful.

## Trade License Clients

Use:

- `Category.name = Trade License`, `Category.frequency = Yearly`.
- `Organization.tradeLicenseNo` for trade license number.
- Yearly `ServicePeriod` rows for issue, renewal, payment, and status tracking.

## Import Sequence

1. Import or create service categories.
2. Import clients and mark inactive clients.
3. Import organizations and link them to clients.
4. Import service profiles and link each one to a client or organization.
5. Import service periods for monthly VAT and yearly returns or renewals.
6. Put unrecognized columns into JSON so no information is lost.
7. Review duplicates manually, especially where the same client appears in VAT, eReturn, ERC, and IRC sheets with slightly different names.

## Duplicate Matching Rules

Use a cautious matching order:

1. Match by E-TIN, NID, phone, or email when available.
2. Match organizations by exact organization name plus owner client.
3. Match by cleaned client name only when there is no better identifier.
4. If uncertain, import as separate records and merge later after review.

## Practical Import Options

For a one-time migration, export Google Sheets tabs to CSV and run a Prisma import script. For repeated imports, build an admin import page that accepts CSV/XLSX, shows a preview, flags duplicates, and then commits the rows.

Passwords should be imported through the same encryption helper used by the app, not stored as plain text.
