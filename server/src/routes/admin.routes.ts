import { Router } from 'express';
import fs from 'fs';
import prisma from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getSafeFilePath } from '../services/storageService.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('ADMIN'));

// GET stats summary
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalApplications,
      totalAppointments,
      totalPrograms,
      approvedApps,
      pendingApps,
      auditCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.visaApplication.count(),
      prisma.appointment.count(),
      prisma.visaProgram.count({ where: { isActive: true } }),
      prisma.visaApplication.count({ where: { status: 'APPROVED' } }),
      prisma.visaApplication.count({
        where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'PROCESSING', 'DOCUMENTS_REQUESTED'] } },
      }),
      prisma.auditLog.count(),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalApplications,
        totalAppointments,
        totalPrograms,
        approvedApps,
        pendingApps,
        auditCount,
        approvalRate: totalApplications > 0 ? Math.round((approvedApps / totalApplications) * 100) : 0,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load stats.' });
  }
});

// GET users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        _count: {
          select: {
            applications: true,
            assignedCases: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const safeUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      role: u.role,
      status: u.status,
      createdAt: u.createdAt,
      profile: u.profile,
      applicationCount: u._count.applications,
      assignedCasesCount: u._count.assignedCases,
    }));

    return res.json({ success: true, data: safeUsers });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load users.' });
  }
});

// PATCH update user role
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const adminId = req.user!.id;

    if (!['CUSTOMER', 'CONSULTANT', 'ADMIN'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role.' });
    }

    // Security check: Prevent self-demotion from ADMIN
    if (id === adminId && role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        error: 'Security restriction: You cannot demote your own administrator account.',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      include: { profile: true },
    });

    await logAuditEvent(req, 'USER_ROLE_CHANGE', 'USER', id, { newRole: role, updatedBy: adminId });

    return res.json({
      success: true,
      message: `User role updated to ${role}.`,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update user role.' });
  }
});

// PATCH update user status
router.patch('/users/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = req.user!.id;

    if (!['ACTIVE', 'SUSPENDED'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status.' });
    }

    if (id === adminId && status === 'SUSPENDED') {
      return res.status(400).json({ success: false, error: 'Cannot suspend your own admin account.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
    });

    await logAuditEvent(req, 'USER_STATUS_CHANGE', 'USER', id, { status, updatedBy: adminId });

    return res.json({ success: true, message: `Account status updated to ${status}.`, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update status.' });
  }
});

// GET consultants list
router.get('/consultants', async (req, res) => {
  try {
    const consultants = await prisma.user.findMany({
      where: {
        role: { in: ['CONSULTANT', 'ADMIN'] },
        status: 'ACTIVE',
      },
      include: {
        profile: true,
        _count: {
          select: {
            assignedCases: { where: { isActive: true } },
          },
        },
      },
    });

    const formatted = consultants.map((c) => ({
      id: c.id,
      email: c.email,
      role: c.role,
      name: c.profile ? `${c.profile.firstName} ${c.profile.lastName}` : c.email,
      activeCasesCount: c._count.assignedCases,
    }));

    return res.json({ success: true, data: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load consultants.' });
  }
});

// GET all applications
router.get('/applications', async (req, res) => {
  try {
    const { status, search } = req.query;

    const where: any = {};
    if (status && typeof status === 'string' && status !== 'ALL') {
      where.status = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { referenceNumber: { contains: search } },
        { destinationCountry: { contains: search } },
        { customer: { email: { contains: search } } },
      ];
    }

    const applications = await prisma.visaApplication.findMany({
      where,
      include: {
        customer: {
          include: { profile: true },
        },
        visaProgram: {
          select: {
            id: true,
            title: true,
            country: true,
            category: true,
          },
        },
        assignments: {
          where: { isActive: true },
          include: {
            consultant: {
              include: { profile: true },
            },
          },
        },
        documents: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: applications });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load applications.' });
  }
});

// POST assign consultant to application
router.post('/applications/:id/assign', async (req, res) => {
  try {
    const { id } = req.params;
    const { consultantId, notes } = req.body;
    const adminId = req.user!.id;

    if (!consultantId) {
      return res.status(400).json({ success: false, error: 'Consultant ID is required.' });
    }

    const consultant = await prisma.user.findFirst({
      where: { id: consultantId, role: { in: ['CONSULTANT', 'ADMIN'] }, status: 'ACTIVE' },
    });

    if (!consultant) {
      return res.status(400).json({ success: false, error: 'Selected consultant does not exist or is inactive.' });
    }

    // Deactivate prior assignments
    await prisma.consultantAssignment.updateMany({
      where: { applicationId: id, isActive: true },
      data: { isActive: false },
    });

    // Create new assignment
    const assignment = await prisma.consultantAssignment.create({
      data: {
        applicationId: id,
        consultantId,
        assignedById: adminId,
        notes: notes || 'Assigned by administrator.',
        isActive: true,
      },
      include: {
        consultant: {
          include: { profile: true },
        },
      },
    });

    await logAuditEvent(req, 'APPLICATION_ASSIGNMENT', 'APPLICATION', id, {
      consultantId,
      assignedBy: adminId,
    });

    return res.json({
      success: true,
      message: 'Consultant assigned successfully.',
      data: assignment,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to assign consultant.' });
  }
});

// PATCH admin update application status
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const adminId = req.user!.id;

    const existing = await prisma.visaApplication.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    const updated = await prisma.visaApplication.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: {
            changedById: adminId,
            previousStatus: existing.status,
            newStatus: status,
            changeReason: reason || 'Admin override update.',
          },
        },
      },
    });

    await logAuditEvent(req, 'ADMIN_APPLICATION_STATUS_OVERRIDE', 'APPLICATION', id, {
      previousStatus: existing.status,
      newStatus: status,
    });

    return res.json({ success: true, message: 'Status updated.', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update application status.' });
  }
});

// CRUD Visa Programs
router.get('/visa-programs', async (req, res) => {
  try {
    const programs = await prisma.visaProgram.findMany({
      include: {
        officialSources: true,
        documentRequirements: true,
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: programs });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load visa programs.' });
  }
});

router.post('/visa-programs', async (req, res) => {
  try {
    const {
      title,
      country,
      countryCode,
      flagEmoji,
      category,
      flow,
      processingTime,
      validity,
      entryType,
      feeAmount,
      feeCurrency,
      description,
      eligibilitySummary,
      officialPortalUrl,
      isPopular,
      officialSources = [],
      requirements = [],
    } = req.body;

    if (!title || !country || !officialPortalUrl) {
      return res.status(400).json({ success: false, error: 'Title, country, and official portal URL are required.' });
    }

    const program = await prisma.visaProgram.create({
      data: {
        title,
        country,
        countryCode: countryCode || 'XX',
        flagEmoji: flagEmoji || '🌐',
        category: category || 'TOURIST',
        flow: flow || 'INDIA_TO_WORLD',
        processingTime: processingTime || '3-5 Days',
        validity: validity || '30 Days',
        entryType: entryType || 'Single Entry',
        feeAmount: parseFloat(feeAmount || '0'),
        feeCurrency: feeCurrency || 'USD',
        description: description || '',
        eligibilitySummary: eligibilitySummary || '',
        officialPortalUrl,
        isPopular: Boolean(isPopular),
        isActive: true,
        officialSources: {
          create: officialSources.map((s: any) => ({
            country,
            authorityName: s.authorityName || 'Official Authority',
            officialUrl: s.officialUrl || officialPortalUrl,
            lastVerifiedDate: s.lastVerifiedDate || new Date().toISOString().split('T')[0],
            notes: s.notes || null,
            isOfficialGovernment: true,
          })),
        },
        documentRequirements: {
          create: requirements.map((r: any) => ({
            title: r.title,
            description: r.description || '',
            isMandatory: r.isMandatory !== false,
            allowedMimeTypes: r.allowedMimeTypes || 'image/jpeg,image/png,application/pdf',
            maxSizeBytes: r.maxSizeBytes || 5242880,
          })),
        },
      },
      include: {
        officialSources: true,
        documentRequirements: true,
      },
    });

    await logAuditEvent(req, 'VISA_PROGRAM_CREATED', 'VISA_PROGRAM', program.id, { title });

    return res.status(201).json({ success: true, data: program });
  } catch (error) {
    console.error('Create visa program error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create visa program.' });
  }
});

router.put('/visa-programs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      country,
      countryCode,
      flagEmoji,
      category,
      flow,
      processingTime,
      validity,
      entryType,
      feeAmount,
      feeCurrency,
      description,
      eligibilitySummary,
      officialPortalUrl,
      isPopular,
      isActive,
    } = req.body;

    const updated = await prisma.visaProgram.update({
      where: { id },
      data: {
        title,
        country,
        countryCode,
        flagEmoji,
        category,
        flow,
        processingTime,
        validity,
        entryType,
        feeAmount: feeAmount !== undefined ? parseFloat(feeAmount) : undefined,
        feeCurrency,
        description,
        eligibilitySummary,
        officialPortalUrl,
        isPopular: isPopular !== undefined ? Boolean(isPopular) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    await logAuditEvent(req, 'VISA_PROGRAM_UPDATED', 'VISA_PROGRAM', id, { title });

    return res.json({ success: true, data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update visa program.' });
  }
});

router.delete('/visa-programs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if applications exist
    const count = await prisma.visaApplication.count({ where: { visaProgramId: id } });
    if (count > 0) {
      // Soft deactivate instead of crashing foreign keys
      await prisma.visaProgram.update({
        where: { id },
        data: { isActive: false },
      });
      return res.json({
        success: true,
        message: 'Program has linked applications. It has been deactivated rather than deleted.',
      });
    }

    await prisma.visaProgram.delete({ where: { id } });
    await logAuditEvent(req, 'VISA_PROGRAM_DELETED', 'VISA_PROGRAM', id);

    return res.json({ success: true, message: 'Visa program removed.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete program.' });
  }
});

// GET all audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const { action, resourceType } = req.query;

    const where: any = {};
    if (action && typeof action === 'string') where.action = action;
    if (resourceType && typeof resourceType === 'string') where.resourceType = resourceType;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            role: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return res.json({ success: true, data: logs });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve audit logs.' });
  }
});

// GET download any document as admin
router.get('/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await prisma.privateDocument.findUnique({
      where: { id },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    const safePath = getSafeFilePath(document.storedFilename);
    if (!safePath) {
      return res.status(404).json({ success: false, error: 'File missing from server storage.' });
    }

    await logAuditEvent(req, 'ADMIN_DOCUMENT_DOWNLOAD', 'DOCUMENT', document.id, {
      originalName: document.originalName,
    });

    res.setHeader('Content-Type', document.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(document.originalName)}"`);
    res.setHeader('X-Content-Type-Options', 'nosniff');

    const fileStream = fs.createReadStream(safePath);
    return fileStream.pipe(res);
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to download document.' });
  }
});

export default router;
