import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL || process.env.NOW_REGION !== undefined;

// In Vercel serverless environment, root filesystem is read-only; use /tmp for ephemeral storage
const resolvedStoragePath = isVercel
  ? path.join('/tmp', 'auravisa_uploads')
  : path.resolve(process.cwd(), process.env.STORAGE_PATH || 'storage/uploads');

// Safely ensure storage directory exists without breaking on read-only serverless root
try {
  if (!fs.existsSync(resolvedStoragePath)) {
    fs.mkdirSync(resolvedStoragePath, { recursive: true });
  }
} catch (e) {
  console.warn('[Storage] Notice: filesystem initialization deferred or limited in serverless environment.');
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET || 'auravisa-secure-session-key-fallback-random-string-99',
  nodeEnv: process.env.NODE_ENV || 'development',
  isVercel,
  storagePath: resolvedStoragePath,
  frontendOrigin: process.env.FRONTEND_ORIGIN || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

export default config;
