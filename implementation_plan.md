# Modernization & Central Management Portal Implementation Plan

This plan outlines the architecture to transform GovDeskBD into a centralized, modern, animated, and fast-loading portal for managing client applications. 

## 1. Technology Stack (Approved)
* **Backend:** Next.js App Router (Server Actions & API Routes).
* **Database:** PostgreSQL (Hosted on Supabase).
* **ORM:** Prisma.
* **Authentication:** NextAuth.js v5 (Auth.js) for internal Admin team.

## 2. Architecture & Data Schema

### Core Tables
* **Users:** Internal Admin team (Name, Email, Role).
* **Clients:** The individual person. 
  * Fields: `Id`, `Name`, `NID`, `Phone`, `Email`, `EncryptedEmailPassword`, `IsActive`, `Notes`.
* **Organizations:** Businesses owned by clients.
  * Fields: `Id`, `ClientId`, `Name`, `Address`, `TradeLicenseNo`.
* **Categories (Services):** Types of services (VAT, eReturn, IRC, ERC, Trade License).
* **ServiceProfiles:** Secure portal login details for a specific Organization/Client and Category.
  * Fields: `Id`, `OrganizationId`/`ClientId`, `CategoryId`, `PortalUserId`, `PortalEncryptedPassword`.
* **ServicePeriods (Tracking & Billing):** Monthly or Yearly records.
  * Fields: `Id`, `ServiceProfileId`, `Period`, `PaymentAmount`, `IsPaid`, `Status`, `PeriodData` (JSON for VAT Status, Tax Paid, etc.).

### Enterprise Features
* **Audit Logs / History:** Every Create, Update, or Delete action will be logged in an `AuditLogs` table (Who did what, when, and changes made). This enables the **Timeline** view for any Client or Organization.
* **Containerization:** The application will be containerized using **Docker** and `docker-compose` for standard, consistent deployments across any environment.
* **Global Error Handling & Logging:** Implementation of robust Next.js error boundaries (`error.tsx`), API try/catch wrappers, and backend logging (e.g., Pino or Winston) to trace issues efficiently.

## 3. UI/UX & Data Management Features
* **Framer Motion:** Smooth transitions and micro-interactions.
* **Data Grids:** A powerful, reusable React Table component implementing:
  * Server-side **Pagination** to handle thousands of records.
  * Server-side **Sorting** by any column.
  * Global and column-specific **Searching/Filtering**.
* **Skeleton Loaders:** Instant UI rendering while data fetches.

## 4. Security
* **AES-256 Encryption:** Secure encryption for Portal Passwords and Email Passwords stored in the database.

---
*Status: Approved. Execution starting.*
