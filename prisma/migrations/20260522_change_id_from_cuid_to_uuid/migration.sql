-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Backup and recreate tables with UUID instead of CUID

-- Step 1: Create new tables with UUID
CREATE TABLE "User_new" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_new_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "User_new_email_key" UNIQUE ("email")
);

CREATE TABLE "Client_new" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "nid" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "encryptedEmailPassword" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Client_new_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Organization_new" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "clientId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "tradeLicenseNo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Organization_new_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Organization_new_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client_new" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "Category_new" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Category_new_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Category_new_name_key" UNIQUE ("name")
);

CREATE TABLE "ServiceProfile_new" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "clientId" UUID,
    "organizationId" UUID,
    "categoryId" UUID NOT NULL,
    "portalUserId" TEXT,
    "portalEncryptedPassword" TEXT,
    "portalEmail" TEXT,
    "portalEncryptedEmailPassword" TEXT,
    "miscellaneousData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServiceProfile_new_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ServiceProfile_new_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client_new" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceProfile_new_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization_new" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ServiceProfile_new_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category_new" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "ServicePeriod_new" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "serviceProfileId" UUID NOT NULL,
    "period" TEXT NOT NULL,
    "paymentAmount" DOUBLE PRECISION DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "serviceCharge" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT,
    "periodData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ServicePeriod_new_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ServicePeriod_new_serviceProfileId_fkey" FOREIGN KEY ("serviceProfileId") REFERENCES "ServiceProfile_new" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "AuditLog_new" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "userId" UUID,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_new_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "AuditLog_new_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User_new" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Step 2: Copy data (if any exists) - create mapping from old to new IDs
INSERT INTO "User_new" ("id", "name", "email", "password", "role", "createdAt", "updatedAt")
SELECT "id"::UUID, "name", "email", "password", "role", "createdAt", "updatedAt" FROM "User" WHERE "id" != '';

INSERT INTO "Client_new" ("id", "name", "nid", "phone", "email", "encryptedEmailPassword", "isActive", "notes", "createdAt", "updatedAt")
SELECT "id"::UUID, "name", "nid", "phone", "email", "encryptedEmailPassword", "isActive", "notes", "createdAt", "updatedAt" FROM "Client" WHERE "id" != '';

INSERT INTO "Category_new" ("id", "name", "frequency", "createdAt", "updatedAt")
SELECT "id"::UUID, "name", "frequency", "createdAt", "updatedAt" FROM "Category" WHERE "id" != '';

INSERT INTO "Organization_new" ("id", "clientId", "name", "address", "tradeLicenseNo", "createdAt", "updatedAt")
SELECT "id"::UUID, "clientId"::UUID, "name", "address", "tradeLicenseNo", "createdAt", "updatedAt" FROM "Organization" WHERE "id" != '';

INSERT INTO "ServiceProfile_new" ("id", "clientId", "organizationId", "categoryId", "portalUserId", "portalEncryptedPassword", "portalEmail", "portalEncryptedEmailPassword", "miscellaneousData", "createdAt", "updatedAt")
SELECT "id"::UUID, "clientId"::UUID, "organizationId"::UUID, "categoryId"::UUID, "portalUserId", "portalEncryptedPassword", "portalEmail", "portalEncryptedEmailPassword", "miscellaneousData", "createdAt", "updatedAt" FROM "ServiceProfile" WHERE "id" != '';

INSERT INTO "ServicePeriod_new" ("id", "serviceProfileId", "period", "paymentAmount", "isPaid", "serviceCharge", "status", "periodData", "createdAt", "updatedAt")
SELECT "id"::UUID, "serviceProfileId"::UUID, "period", "paymentAmount", "isPaid", "serviceCharge", "status", "periodData", "createdAt", "updatedAt" FROM "ServicePeriod" WHERE "id" != '';

INSERT INTO "AuditLog_new" ("id", "userId", "action", "entity", "entityId", "details", "createdAt")
SELECT "id"::UUID, "userId"::UUID, "action", "entity", "entityId", "details", "createdAt" FROM "AuditLog" WHERE "id" != '';

-- Step 3: Drop old tables
DROP TABLE "AuditLog" CASCADE;
DROP TABLE "ServicePeriod" CASCADE;
DROP TABLE "ServiceProfile" CASCADE;
DROP TABLE "Organization" CASCADE;
DROP TABLE "Category" CASCADE;
DROP TABLE "Client" CASCADE;
DROP TABLE "User" CASCADE;

-- Step 4: Rename new tables to original names
ALTER TABLE "User_new" RENAME TO "User";
ALTER TABLE "Client_new" RENAME TO "Client";
ALTER TABLE "Organization_new" RENAME TO "Organization";
ALTER TABLE "Category_new" RENAME TO "Category";
ALTER TABLE "ServiceProfile_new" RENAME TO "ServiceProfile";
ALTER TABLE "ServicePeriod_new" RENAME TO "ServicePeriod";
ALTER TABLE "AuditLog_new" RENAME TO "AuditLog";

-- Step 5: Create indexes (Prisma will handle these, but adding for safety)
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");
