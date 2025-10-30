-- CreateTable
CREATE TABLE IF NOT EXISTS "hackathon_form_designs" (
    "id" TEXT NOT NULL,
    "hackathonId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "template" TEXT NOT NULL DEFAULT 'modern',
    "htmlContent" TEXT,
    "cssContent" TEXT,
    "jsContent" TEXT,
    "settings" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hackathon_form_designs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "hackathon_form_designs_hackathonId_key" ON "hackathon_form_designs"("hackathonId");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'hackathon_form_designs_hackathonId_fkey'
    ) THEN
        ALTER TABLE "hackathon_form_designs" ADD CONSTRAINT "hackathon_form_designs_hackathonId_fkey" FOREIGN KEY ("hackathonId") REFERENCES "hackathons"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
