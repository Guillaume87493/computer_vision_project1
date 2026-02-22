
// prisma/prisma.ts
// Dit zorgt ervoor dat er maar 1 Prisma Client is in development mode
// Zo voorkom je hot-reload issues
// Installeer eerst: npm install @prisma/client

import { PrismaClient } from "@prisma/client"

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// ──────────────────────────────────────────────
// "migrate": "npx prisma generate && npx prisma migrate dev --schema prisma/schema.prisma"

// Daarna kan je in terminal uitvoeren:
// npm run migrate
// om je database te migreren naar de laatste schema versie

// Stel je hebt een probleem met je database en Prisma, 
// voer dan uit in terminal:
// npx prisma generate
// om je Prisma Client te hergenereren
