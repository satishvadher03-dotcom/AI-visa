import { Router } from 'express';
import fs from 'fs';
import prisma from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { getSafeFilePath } from '../services/storageService.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();

router.use(requireAuth);
router.use(requireRole('CONSULTANT', 'ADMIN'));

// Helper to check if consultant is authorized for a specific application
async function verifyConsultantCaseAccess(consultantId: string, role: string, applicationId: string) {
  if (role === 'ADMIN') return true;

  const assignment = await prisma.consultantAssignment.findFirst({
    where: {
      applicationId,
      consultantId,
      isActive: true,
    },
  });

  return !!assignment;
}

// GET assigned cases
router.get('/assigned-cases', async (req, res) => {
  try {
    const consultantId = req.user!.id;
    const isSuperAdmin = req.user!.role === 'ADMIN';

    const applications = await prisma.visaApplication.findMany({
      where: isSuperAdmin
        ? {}
        : {
            assignments: {
              some: {
                consultantId,
                isActive: true,
              },
            },
          },
      include: {
        customer: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        visaProgram: {
          select: {
            title: true,
            country: true,
            countryCode: true,
            category: true,
            processingTime: true,
          },
        },
        documents: {
          select: {
            id: true,
            originalName: true,
            verificationStatus: true,
            uploadedAt: true,
          },
        },
        assignments: {
          where: { isActive: true },
          include: {
            consultant: {
              select: {
                profile: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Assigned cases fetch error:', error);
    return res.status(500).json({ success: false, error: 'Could not load assigned cases.' });
  }
});

// GET single application details (assignment check enforced)
router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const consultantId = req.user!.id;

    const hasAccess = await verifyConsultantCaseAccess(consultantId, req.user!.role, id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized. You are not assigned to this applicant case.',
      });
    }

    const application = await prisma.visaApplication.findUnique({
      where: { id },
      include: {
        customer: {
          include: { profile: true },
        },
        visaProgram: {
          include: {
            officialSources: true,
            documentRequirements: true,
          },
        },
        documents: {
          include: {
            requirement: true,
          },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                email: true,
                profile: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        caseNotes: {
          include: {
            author: {
              select: {
                email: true,
                profile: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        assignments: {
          include: {
            consultant: {
              include: { profile: true },
            },
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    return res.json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve application details.' });
  }
});

// PATCH update application status
router.patch('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason, rejectionReason } = req.body;
    const consultantId = req.user!.id;

    const hasAccess = await verifyConsultantCaseAccess(consultantId, req.user!.role, id);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized to modify status for unassigned application.',
      });
    }

    const existingApp = await prisma.visaApplication.findUnique({ where: { id } });
    if (!existingApp) {
      return res.status(404).json({ success: false, error: 'Application not found.' });
    }

    const previousStatus = existingApp.status;

    const updatedApp = await prisma.visaApplication.update({
      where: { id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason || reason : existingApp.rejectionReason,
        statusHistory: {
          create: {
            changedById: consultantId,
            previousStatus,
            newStatus: status,
            changeReason: reason || `Status updated to ${status} by consultant.`,
          },
        },
      },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    await logAuditEvent(req, 'APPLICATION_STATUS_UPDATE', 'APPLICATION', id, {
      previousStatus,
      newStatus: status,
      reason,
    });

    return res.json({
      success: true,
      message: `Status updated to ${status}.`,
      data: updatedApp,
    });
  } catch (error) {
    console.error('Status update error:', error);
    return res.status(500).json({ success: false, error: 'Failed to update application status.' });
  }
});

// POST add internal case note
router.post('/applications/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { noteText, isConfidential = true } = req.body;
    const consultantId = req.user!.id;

    if (!noteText || !noteText.trim()) {
      return res.status(400).json({ success: false, error: 'Note text cannot be empty.' });
    }

    const hasAccess = await verifyConsultantCaseAccess(consultantId, req.user!.role, id);
    if (!hasAccess) {
      return res.status(403).json({ success: false, error: 'Unauthorized to add notes to this application.' });
    }

    const note = await prisma.internalCaseNote.create({
      data: {
        applicationId: id,
        authorId: consultantId,
        noteText: noteText.trim(),
        isConfidential: Boolean(isConfidential),
      },
      include: {
        author: {
          select: {
            email: true,
            profile: true,
          },
        },
      },
    });

    await logAuditEvent(req, 'CASE_NOTE_CREATED', 'CASE_NOTE', note.id, {
      applicationId: id,
      isConfidential,
    });

    return res.status(201).json({
      success: true,
      message: 'Case note recorded.',
      data: note,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to record case note.' });
  }
});

// GET download document (only if assigned to applicant's case or admin)
router.get('/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const consultantId = req.user!.id;

    const document = await prisma.privateDocument.findUnique({
      where: { id },
      include: { application: true },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    if (document.applicationId) {
      const hasAccess = await verifyConsultantCaseAccess(consultantId, req.user!.role, document.applicationId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          error: 'Access denied: You are not assigned to this case.',
        });
      }
    }

    const safePath = getSafeFilePath(document.storedFilename);
    if (!safePath) {
      return res.status(404).json({ success: false, error: 'Physical document file missing.' });
    }

    await logAuditEvent(req, 'STAFF_DOCUMENT_DOWNLOAD', 'DOCUMENT', document.id, {
      originalName: document.originalName,
      consultantId,
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

// PATCH verify or reject document
router.patch('/documents/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, rejectionNotes } = req.body;
    const consultantId = req.user!.id;

    if (!['PENDING', 'VERIFIED', 'REJECTED', 'REQUIRES_REUPLOAD'].includes(verificationStatus)) {
      return res.status(400).json({ success: false, error: 'Invalid verification status.' });
    }

    const doc = await prisma.privateDocument.findUnique({
      where: { id },
    });

    if (!doc) {
      return res.status(404).json({ success: false, error: 'Document not found.' });
    }

    if (doc.applicationId) {
      const hasAccess = await verifyConsultantCaseAccess(consultantId, req.user!.role, doc.applicationId);
      if (!hasAccess) {
        return res.status(403).json({ success: false, error: 'Access denied.' });
      }
    }

    const updated = await prisma.privateDocument.update({
      where: { id },
      data: {
        verificationStatus,
        rejectionNotes: rejectionNotes || null,
      },
    });

    await logAuditEvent(req, 'DOCUMENT_VERIFICATION', 'DOCUMENT', id, {
      verificationStatus,
      rejectionNotes,
    });

    return res.json({
      success: true,
      message: `Document status updated to ${verificationStatus}.`,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to verify document.' });
  }
});

// GET consultant appointments
router.get('/appointments', async (req, res) => {
  try {
    const consultantId = req.user!.id;
    const isSuperAdmin = req.user!.role === 'ADMIN';

    const appointments = await prisma.appointment.findMany({
      where: isSuperAdmin ? {} : { consultantId },
      include: {
        customer: {
          select: {
            email: true,
            profile: true,
          },
        },
        application: {
          select: {
            referenceNumber: true,
            destinationCountry: true,
          },
        },
      },
      orderBy: { appointmentDate: 'asc' },
    });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load consultant appointments.' });
  }
});

// PATCH consultant appointment status
router.patch('/appointments/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, meetingLink } = req.body;

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        status,
        notes: notes !== undefined ? notes : undefined,
        meetingLink: meetingLink !== undefined ? meetingLink : undefined,
      },
    });

    await logAuditEvent(req, 'APPOINTMENT_STATUS_UPDATE', 'APPOINTMENT', id, { status });

    return res.json({ success: true, message: 'Appointment updated.', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update appointment.' });
  }
});

export default router;
