CREATE TABLE "TaxFiscalYear" (
    "id" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "strategy" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxFiscalYear_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaxSlab" (
    "id" TEXT NOT NULL,
    "fiscalYearId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "limitAmount" DOUBLE PRECISION,
    "rate" DOUBLE PRECISION NOT NULL,
    "label" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxSlab_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TaxFiscalYear_year_key" ON "TaxFiscalYear"("year");
CREATE INDEX "TaxSlab_fiscalYearId_idx" ON "TaxSlab"("fiscalYearId");
CREATE UNIQUE INDEX "TaxSlab_fiscalYearId_sequence_key" ON "TaxSlab"("fiscalYearId", "sequence");

ALTER TABLE "TaxSlab" ADD CONSTRAINT "TaxSlab_fiscalYearId_fkey" FOREIGN KEY ("fiscalYearId") REFERENCES "TaxFiscalYear"("id") ON DELETE CASCADE ON UPDATE CASCADE;
