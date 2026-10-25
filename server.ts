import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import config from './server/src/config.js';
import { authenticateSession } from './server/src/middleware/auth.js';

// Route imports
import authRoutes from './server/src/routes/auth.routes.js';
import visaRoutes from './server/src/routes/visa.routes.js';
import customerRoutes from './server/src/routes/customer.routes.js';
import consultantRoutes from './server/src/routes/consultant.routes.js';
import adminRoutes from './server/src/routes/admin.routes.js';

async function bootstrapServer() {
  const app = express();

  // Trust proxy for secure cookies behind Cloud Run reverse proxies
  app.set('trust proxy', 1);

  // Basic security headers (allowing iframe preview in AI Studio)
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Body and cookie parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Session configuration with iframe cookie support
  app.use(
    session({
      name: 'auravisa.sid',
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: 'auto',
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    })
  );

  // Session user loader middleware
  app.use(authenticateSession);

  // Health check API
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'UP',
      app: 'AuraVisa Global API',
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  // Versioned API Routes under /api/v1
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1', visaRoutes);
  app.use('/api/v1/customer', customerRoutes);
  app.use('/api/v1/consultant', consultantRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // Centralized API Error Handler
  app.use('/api', (err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API Error Handler caught:', err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal server error occurred.',
    });
  });

  // Frontend Integration
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
    // In production, serve dist folder and fallback to index.html
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
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
