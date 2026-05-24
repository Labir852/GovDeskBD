-- Add optional portal URL support to service categories.
ALTER TABLE "Category"
ADD COLUMN "portalUrl" TEXT;
