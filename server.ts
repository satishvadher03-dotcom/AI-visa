import { Request, Response } from 'express';
import path from 'path';
import config from './server/src/config.js';
import app from './server/src/app.js';

async function bootstrapServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev mode, attach Vite dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: config.port,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {},
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted in development mode');
  } else {
    // In production standalone mode, serve dist folder and fallback to index.html
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use((await import('express')).default.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Start HTTP listener
  app.listen(config.port, '0.0.0.0', () => {
    console.log(`[AuraVisa Global] Server running on http://0.0.0.0:${config.port}`);
  });
}

bootstrapServer().catch((err) => {
  console.error('Fatal error during AuraVisa server bootstrap:', err);
  process.exit(1);
});
