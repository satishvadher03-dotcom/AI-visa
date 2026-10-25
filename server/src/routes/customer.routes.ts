import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import prisma from '../db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import {
  uploadMiddleware,
  calculateFileChecksum,
  validateFileSignature,
  getSafeFilePath,
  deleteStoredFile,
} from '../services/storageService.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();

// Apply auth check to all customer routes
router.use(requireAuth);
router.use(requireRole('CUSTOMER', 'ADMIN'));

// GET customer applications
router.get('/applications', async (req, res) => {
  try {
    const customerId = req.user!.id;
    const applications = await prisma.visaApplication.findMany({
      where: { customerId },
      include: {
        visaProgram: {
          select: {
            title: true,
            country: true,
            countryCode: true,
            flagEmoji: true,
            processingTime: true,
            feeAmount: true,
            feeCurrency: true,
          },
        },
        assignments: {
          where: { isActive: true },
          include: {
            consultant: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        documents: {
          select: {
            id: true,
            originalName: true,
            fileSizeBytes: true,
            mimeType: true,
            verificationStatus: true,
            rejectionNotes: true,
            uploadedAt: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Customer applications fetch error:', error);
    return res.status(500).json({ success: false, error: 'Could not load your applications.' });
  }
});

// GET single application (strictly customer owned)
router.get('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const application = await prisma.visaApplication.findFirst({
      where: {
        id,
        customerId, // Strict customer isolation
      },
      include: {
        visaProgram: {
          include: {
            documentRequirements: true,
            officialSources: true,
          },
        },
        assignments: {
          include: {
            consultant: {
              select: {
                id: true,
                email: true,
                profile: true,
              },
            },
          },
        },
        documents: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
        caseNotes: {
          where: { isConfidential: false }, // Customers do NOT see internal confidential notes
        },
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found or unauthorized access.',
      });
    }

    return res.json({ success: true, data: application });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve application details.' });
  }
});

// POST create new application
router.post('/applications', async (req, res) => {
  try {
    const customerId = req.user!.id;
    const { visaProgramId, travelDate, applicantNotes } = req.body;

    if (!visaProgramId) {
      return res.status(400).json({ success: false, error: 'Visa program selection is required.' });
    }

    const program = await prisma.visaProgram.findUnique({
      where: { id: visaProgramId },
    });

    if (!program || !program.isActive) {
      return res.status(400).json({ success: false, error: 'Invalid or inactive visa program.' });
    }

    const year = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const referenceNumber = `AV-${year}-${randomSuffix}`;

    const application = await prisma.visaApplication.create({
      data: {
        referenceNumber,
        customerId,
        visaProgramId: program.id,
        destinationCountry: program.country,
        visaCategory: program.category,
        status: 'SUBMITTED',
        travelDate: travelDate ? new Date(travelDate) : null,
        applicantNotes: applicantNotes ? applicantNotes.trim() : null,
        statusHistory: {
          create: {
            changedById: customerId,
            previousStatus: 'DRAFT',
            newStatus: 'SUBMITTED',
            changeReason: 'Application submitted by applicant.',
          },
        },
      },
      include: {
        visaProgram: true,
      },
    });

    // Auto-assign an active consultant if available
    const availableConsultant = await prisma.user.findFirst({
      where: { role: 'CONSULTANT', status: 'ACTIVE' },
    });

    if (availableConsultant) {
      await prisma.consultantAssignment.create({
        data: {
          applicationId: application.id,
          consultantId: availableConsultant.id,
          assignedById: customerId,
          notes: 'Auto-assigned to consultant pool upon submission.',
          isActive: true,
        },
      });
    }

    await logAuditEvent(req, 'APPLICATION_CREATED', 'APPLICATION', application.id, {
      referenceNumber: application.referenceNumber,
      visaProgram: program.title,
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      data: application,
    });
  } catch (error) {
    console.error('Create application error:', error);
    return res.status(500).json({ success: false, error: 'Failed to create application.' });
  }
});

// GET customer documents
router.get('/documents', async (req, res) => {
  try {
    const customerId = req.user!.id;
    const documents = await prisma.privateDocument.findMany({
      where: { uploaderId: customerId },
      include: {
        application: {
          select: {
            referenceNumber: true,
            destinationCountry: true,
          },
        },
        requirement: {
          select: {
            title: true,
          },
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return res.json({ success: true, data: documents });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load documents.' });
  }
});

// POST upload private document
router.post('/documents/upload', uploadMiddleware.single('file'), async (req, res) => {
  try {
    const customerId = req.user!.id;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No document file uploaded.' });
    }

    const { applicationId, requirementId } = req.body;

    // Verify application ownership if applicationId provided
    if (applicationId) {
      const app = await prisma.visaApplication.findFirst({
        where: { id: applicationId, customerId },
      });
      if (!app) {
        // Remove uploaded file to prevent dangling storage
        deleteStoredFile(file.filename);
        return res.status(403).json({ success: false, error: 'Application does not belong to your account.' });
      }
    }

    // Verify file signature
    const isValidSignature = await validateFileSignature(file.path, file.mimetype);
    if (!isValidSignature) {
      deleteStoredFile(file.filename);
      return res.status(400).json({
        success: false,
        error: 'File signature does not match reported MIME type. Upload rejected for security.',
      });
    }

    // Compute checksum
    const checksum = await calculateFileChecksum(file.path);

    // Save document metadata in database
    const document = await prisma.privateDocument.create({
      data: {
        uploaderId: customerId,
        applicationId: applicationId || null,
        requirementId: requirementId || null,
        originalName: path.basename(file.originalname),
        storedFilename: file.filename,
        fileSizeBytes: file.size,
        mimeType: file.mimetype,
        checksumSha256: checksum,
        storagePath: 'storage/uploads',
        verificationStatus: 'PENDING',
      },
    });

    await logAuditEvent(req, 'DOCUMENT_UPLOAD', 'DOCUMENT', document.id, {
      originalName: document.originalName,
      fileSizeBytes: document.fileSizeBytes,
      applicationId,
    });

    return res.status(201).json({
      success: true,
      message: 'Document securely uploaded and queued for consultant verification.',
      data: document,
    });
  } catch (error: any) {
    console.error('Document upload error:', error);
    if (req.file) {
      deleteStoredFile(req.file.filename);
    }
    return res.status(500).json({ success: false, error: error.message || 'Document upload failed.' });
  }
});

// GET download customer's own document
router.get('/documents/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const document = await prisma.privateDocument.findFirst({
      where: {
        id,
        uploaderId: customerId, // Customer ownership check
      },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found or unauthorized.' });
    }

    const safePath = getSafeFilePath(document.storedFilename);
    if (!safePath) {
      return res.status(404).json({ success: false, error: 'Stored document file not found on server.' });
    }

    await logAuditEvent(req, 'DOCUMENT_DOWNLOAD', 'DOCUMENT', document.id, {
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

// DELETE customer document
router.delete('/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const document = await prisma.privateDocument.findFirst({
      where: { id, uploaderId: customerId },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: 'Document not found or unauthorized.' });
    }

    // Delete from disk
    deleteStoredFile(document.storedFilename);

    // Delete record
    await prisma.privateDocument.delete({
      where: { id },
    });

    await logAuditEvent(req, 'DOCUMENT_DELETE', 'DOCUMENT', id, {
      originalName: document.originalName,
    });

    return res.json({ success: true, message: 'Document deleted successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Could not delete document.' });
  }
});

// GET customer appointments
router.get('/appointments', async (req, res) => {
  try {
    const customerId = req.user!.id;
    const appointments = await prisma.appointment.findMany({
      where: { customerId },
      include: {
        consultant: {
          select: {
            profile: true,
            email: true,
          },
        },
      },
      orderBy: { appointmentDate: 'desc' },
    });

    return res.json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load appointments.' });
  }
});

// PATCH cancel customer appointment
router.patch('/appointments/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const appointment = await prisma.appointment.findFirst({
      where: { id, customerId },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await logAuditEvent(req, 'APPOINTMENT_CANCEL', 'APPOINTMENT', id);

    return res.json({ success: true, message: 'Appointment cancelled.', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to cancel appointment.' });
  }
});

// GET customer enquiries
router.get('/enquiries', async (req, res) => {
  try {
    const customerId = req.user!.id;
    const enquiries = await prisma.enquiry.findMany({
      where: { userId: customerId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json({ success: true, data: enquiries });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load enquiries.' });
  }
});

// GET profile
router.get('/profile', async (req, res) => {
  try {
    const customerId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: customerId },
      include: { profile: true },
    });
    return res.json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to load profile.' });
  }
});

// PUT update profile
router.put('/profile', async (req, res) => {
  try {
    const customerId = req.user!.id;
    const { firstName, lastName, phone, nationality, passportNumber, address, city, country } = req.body;

    const updatedProfile = await prisma.userProfile.upsert({
      where: { userId: customerId },
      update: {
        firstName,
        lastName,
        phone,
        nationality,
        passportNumber,
        address,
        city,
        country,
      },
      create: {
        userId: customerId,
        firstName: firstName || 'User',
        lastName: lastName || '',
        phone,
        nationality,
        passportNumber,
        address,
        city,
        country,
      },
    });

    await logAuditEvent(req, 'PROFILE_UPDATE', 'USER', customerId);

    return res.json({ success: true, message: 'Profile updated successfully.', data: updatedProfile });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update profile.' });
  }
});

export default router;
