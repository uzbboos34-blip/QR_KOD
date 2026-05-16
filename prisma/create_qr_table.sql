CREATE TABLE IF NOT EXISTS "qr_codes" (
  "id"        TEXT NOT NULL,
  "type"      TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "qrDataUrl" TEXT NOT NULL,
  "label"     TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "qr_codes_pkey" PRIMARY KEY ("id")
);
