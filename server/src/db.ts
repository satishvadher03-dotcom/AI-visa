import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// On Vercel serverless execution, SQLite cannot write to read-only app directory.
// If DATABASE_URL is SQLite, copy existing seeded dev.db to /tmp so writes succeed.
if (process.env.VERCEL || process.env.NOW_REGION) {
  const currentDbUrl = process.env.DATABASE_URL || 'file:./dev.db';
  if (currentDbUrl.startsWith('file:') && !currentDbUrl.includes('/tmp/')) {
    const tmpDbPath = '/tmp/auravisa_dev.db';
    if (!fs.existsSync(tmpDbPath)) {
      const candidates = [
        path.resolve(process.cwd(), 'prisma/dev.db'),
        path.resolve(process.cwd(), 'dev.db'),
      ];
      for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
          try {
            fs.copyFileSync(candidate, tmpDbPath);
            console.log(`[Database] Initialized serverless SQLite database in ${tmpDbPath}`);
            break;
          } catch (copyErr) {
            console.warn('[Database] Failed to copy SQLite db to /tmp:', copyErr);
          }
        }
      }
    }
    process.env.DATABASE_URL = `file:${tmpDbPath}`;
  }
}

export const prisma =
  global.__prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
