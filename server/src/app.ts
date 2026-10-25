import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import config from './config.js';
import { authenticateSession } from './middleware/auth.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import visaRoutes from './routes/visa.routes.js';
import customerRoutes from './routes/customer.routes.js';
import consultantRoutes from './routes/consultant.routes.js';
import adminRoutes from './routes/admin.routes.js';

export function createExpressApp() {
  const app = express();

  // Trust proxy for secure cookies behind reverse proxies (Vercel, Cloud Run, AWS)
  app.set('trust proxy', 1);

  // CORS & Security headers for decoupled or serverless hosting
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    } else if (config.frontendOrigin) {
      res.setHeader('Access-Control-Allow-Origin', config.frontendOrigin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    if (req.method === 'OPTIONS') {
      res.sendStatus(204);
      return;
    }
    next();
  });

  // Body and cookie parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Session configuration with cross-site / iframe cookie resilience
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
      platform: config.isVercel ? 'vercel-serverless' : 'node-server',
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
    console.error('API Error caught by centralized handler:', err);
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Internal server error occurred.',
    });
  });

  return app;
}

export const app = createExpressApp();
export default app;
