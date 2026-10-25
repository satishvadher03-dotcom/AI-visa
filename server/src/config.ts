import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  sessionSecret: process.env.SESSION_SECRET || 'auravisa-secure-session-key-fallback-random-string-99',
  nodeEnv: process.env.NODE_ENV || 'development',
  storagePath: path.resolve(process.cwd(), process.env.STORAGE_PATH || 'storage/uploads'),
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
};

export default config;
