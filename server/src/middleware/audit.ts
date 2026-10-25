import { Request } from 'express';
import prisma from '../db.js';

export async function logAuditEvent(
  req: Request,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
) {
  try {
    const userId = (req.session as any)?.userId || null;
    const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resourceType,
        resourceId,
        ipAddress: ipAddress.slice(0, 45),
        detailsJson: details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
