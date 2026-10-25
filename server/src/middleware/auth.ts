import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import prisma from '../db.js';
import config from '../config.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'CONSULTANT' | 'ADMIN';
  status: string;
  profile?: {
    firstName: string;
    lastName: string;
    phone?: string | null;
    nationality?: string | null;
  } | null;
}

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Creates a cryptographically signed HMAC token for iframe compatibility
 */
export function generateUserToken(userId: string, role: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, role, t: Date.now() })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', config.sessionSecret)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

export function verifyUserToken(token: string): { userId: string; role: string } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    const [payload, signature] = parts;
    const expected = crypto
      .createHmac('sha256', config.sessionSecret)
      .update(payload)
      .digest('base64url');

    if (signature !== expected) return null;
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));

    // Check expiration: 7 days
    if (Date.now() - data.t > 7 * 24 * 60 * 60 * 1000) {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function authenticateSession(req: Request, _res: Response, next: NextFunction) {
  try {
    let userId = req.session?.userId;

    // Check Authorization header or x-session-token for iframe environments
    if (!userId) {
      const authHeader = req.headers.authorization;
      const token =
        authHeader && authHeader.startsWith('Bearer ')
          ? authHeader.slice(7)
          : (req.headers['x-session-token'] as string);

      if (token) {
        const verified = verifyUserToken(token);
        if (verified) {
          userId = verified.userId;
        }
      }
    }

    if (!userId) {
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role as any,
        status: user.status,
        profile: user.profile
          ? {
              firstName: user.profile.firstName,
              lastName: user.profile.lastName,
              phone: user.profile.phone,
              nationality: user.profile.nationality,
            }
          : null,
      };
    }
    next();
  } catch (error) {
    next(error);
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Please log in.',
    });
  }
  next();
}

export function requireRole(...roles: ('CUSTOMER' | 'CONSULTANT' | 'ADMIN')[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Please log in.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Requires one of: ${roles.join(', ')}`,
      });
    }

    next();
  };
}
