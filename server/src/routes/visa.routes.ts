import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db.js';
import { askVisaAssistant } from '../services/aiService.js';
import { logAuditEvent } from '../middleware/audit.js';

const router = Router();

// GET all active visa programs
router.get('/visa-programs', async (req, res) => {
  try {
    const { flow, category, search, popular } = req.query;

    const where: any = { isActive: true };

    if (flow && typeof flow === 'string') {
      where.flow = flow;
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      where.category = category;
    }

    if (popular === 'true') {
      where.isPopular = true;
    }

    if (search && typeof search === 'string') {
      where.OR = [
        { country: { contains: search } },
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const programs = await prisma.visaProgram.findMany({
      where,
      include: {
        officialSources: true,
        documentRequirements: true,
      },
      orderBy: [{ isPopular: 'desc' }, { country: 'asc' }],
    });

    return res.json({
      success: true,
      data: programs,
    });
  } catch (error) {
    console.error('Error fetching visa programs:', error);
    return res.status(500).json({ success: false, error: 'Failed to load visa programs.' });
  }
});

// GET single visa program details
router.get('/visa-programs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await prisma.visaProgram.findUnique({
      where: { id },
      include: {
        officialSources: true,
        documentRequirements: true,
      },
    });

    if (!program) {
      return res.status(404).json({ success: false, error: 'Visa program not found.' });
    }

    return res.json({
      success: true,
      data: program,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to retrieve visa details.' });
  }
});

// POST check eligibility
router.post('/eligibility/check', async (req, res) => {
  try {
    const {
      nationality,
      currentResidence,
      destinationCountry,
      travelPurpose,
      stayDurationDays,
      passportValidityMonths,
      hasCriminalRecord,
      hasPreviousVisaRefusal,
    } = req.body;

    if (!nationality || !destinationCountry || !travelPurpose) {
      return res.status(400).json({
        success: false,
        error: 'Nationality, destination country, and travel purpose are required.',
      });
    }

    // Match with existing visa programs
    const matchedProgram = await prisma.visaProgram.findFirst({
      where: {
        isActive: true,
        country: { contains: destinationCountry },
      },
      include: {
        officialSources: true,
        documentRequirements: true,
      },
    });

    // Rule-based preliminary assessment
    const flags: string[] = [];
    const recommendations: string[] = [];
    let isEligiblePreliminary = true;
    let confidence = 'HIGH';

    if (passportValidityMonths && parseInt(passportValidityMonths, 10) < 6) {
      isEligiblePreliminary = false;
      flags.push('Passport has less than 6 months remaining validity. Most international borders require at least 6 months.');
      recommendations.push('Renew passport before submitting visa application.');
    }

    if (hasCriminalRecord === true || hasCriminalRecord === 'yes') {
      confidence = 'REQUIRES_EXPERT_REVIEW';
      flags.push('Prior record disclosures require manual consular review and certified documentation.');
      recommendations.push('Schedule an in-depth consultation with a senior immigration barrister.');
    }

    if (hasPreviousVisaRefusal === true || hasPreviousVisaRefusal === 'yes') {
      confidence = 'REQUIRES_EXPERT_REVIEW';
      flags.push('Prior refusal history must be declared transparently to avoid misrepresentation penalties.');
      recommendations.push('Prepare refusal appeal letters and supplementary financial proof.');
    }

    return res.json({
      success: true,
      data: {
        destination: destinationCountry,
        nationality,
        isEligiblePreliminary,
        confidence,
        matchedProgram: matchedProgram
          ? {
              id: matchedProgram.id,
              title: matchedProgram.title,
              category: matchedProgram.category,
              processingTime: matchedProgram.processingTime,
              validity: matchedProgram.validity,
              officialPortalUrl: matchedProgram.officialPortalUrl,
              officialSources: matchedProgram.officialSources,
              requiredDocuments: matchedProgram.documentRequirements,
            }
          : null,
        flags,
        recommendations: [
          ...recommendations,
          'Ensure your digital photographs meet biometric specifications (35x45mm, white backdrop).',
          'Have liquid bank statements ready showing active cash flow.',
        ],
        disclaimer:
          'Preliminary Eligibility Advisory: This evaluation is indicative and does not constitute a visa grant or legal entitlement. Sovereign immigration authorities retain sole discretionary approval power.',
      },
    });
  } catch (error) {
    console.error('Eligibility check error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process eligibility assessment.' });
  }
});

// POST submit general enquiry
router.post('/enquiries', async (req, res) => {
  try {
    const { fullName, email, phone, nationality, destinationCountry, visaType, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required.',
      });
    }

    const userId = (req.session as any)?.userId || null;

    const enquiry = await prisma.enquiry.create({
      data: {
        userId,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? phone.trim() : 'N/A',
        nationality: nationality ? nationality.trim() : 'India',
        destinationCountry: destinationCountry ? destinationCountry.trim() : 'General',
        visaType: visaType ? visaType.trim() : 'Tourist',
        message: message.trim(),
        status: 'NEW',
      },
    });

    await logAuditEvent(req, 'ENQUIRY_SUBMISSION', 'ENQUIRY', enquiry.id, {
      email: enquiry.email,
      destination: enquiry.destinationCountry,
    });

    return res.status(201).json({
      success: true,
      message: 'Your enquiry has been received. A visa specialist will respond within 24 hours.',
      data: { id: enquiry.id },
    });
  } catch (error) {
    console.error('Enquiry creation error:', error);
    return res.status(500).json({ success: false, error: 'Could not submit enquiry.' });
  }
});

// POST book consultation appointment
router.post('/appointments', async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      serviceType,
      appointmentDate,
      timeSlot,
      notes,
      destinationCountry,
    } = req.body;

    if (!appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Appointment date and preferred time slot are required.',
      });
    }

    let customerId = (req.session as any)?.userId;

    // If user is guest, locate or create guest customer account
    if (!customerId) {
      if (!email || !fullName) {
        return res.status(400).json({
          success: false,
          error: 'Name and email are required for booking.',
        });
      }

      let existing = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!existing) {
        // Create customer placeholder with secure random hash
        const tempPassword = uuidv4();
        const bcrypt = await import('bcryptjs');
        const hash = await bcrypt.default.hash(tempPassword, 10);
        existing = await prisma.user.create({
          data: {
            email: email.toLowerCase().trim(),
            passwordHash: hash,
            role: 'CUSTOMER',
            status: 'ACTIVE',
            profile: {
              create: {
                firstName: fullName.split(' ')[0] || fullName,
                lastName: fullName.split(' ').slice(1).join(' ') || 'Traveler',
                phone: phone || null,
              },
            },
          },
        });
      }
      customerId = existing.id;
    }

    // Double booking guard: check if slot on this date is already booked
    const existingBooking = await prisma.appointment.findFirst({
      where: {
        appointmentDate,
        timeSlot,
        status: 'SCHEDULED',
      },
    });

    if (existingBooking) {
      return res.status(409).json({
        success: false,
        error: `The slot ${timeSlot} on ${appointmentDate} has already been reserved. Please select another time slot.`,
      });
    }

    // Auto-assign available consultant if present
    const availableConsultant = await prisma.user.findFirst({
      where: { role: 'CONSULTANT', status: 'ACTIVE' },
    });

    const refNumber = `APT-${Math.floor(10000 + Math.random() * 90000)}`;

    const appointment = await prisma.appointment.create({
      data: {
        referenceNumber: refNumber,
        customerId,
        consultantId: availableConsultant ? availableConsultant.id : null,
        serviceType: serviceType || 'VIDEO_CONSULTATION',
        appointmentDate,
        timeSlot,
        status: 'SCHEDULED',
        notes: notes ? `${notes} (Destination: ${destinationCountry || 'Unspecified'})` : null,
        meetingLink: `https://auravisa.com/secure-consult/${refNumber}`,
      },
    });

    await logAuditEvent(req, 'APPOINTMENT_BOOKED', 'APPOINTMENT', appointment.id, {
      referenceNumber: appointment.referenceNumber,
      date: appointmentDate,
      slot: timeSlot,
    });

    return res.status(201).json({
      success: true,
      message: 'Consultation appointment scheduled successfully.',
      data: appointment,
    });
  } catch (error) {
    console.error('Appointment booking error:', error);
    return res.status(500).json({ success: false, error: 'Failed to schedule appointment.' });
  }
});

// POST AI Chat assistant
router.post('/ai/chat', async (req, res) => {
  try {
    const { message, sessionId, language = 'en', history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Message text is required.',
      });
    }

    const currentSessionId = sessionId || uuidv4();
    const userId = (req.session as any)?.userId || null;

    // Retrieve or create chat session
    const chatSession = await prisma.chatSession.upsert({
      where: { sessionId: currentSessionId },
      update: {
        language: ['en', 'gu', 'hi'].includes(language) ? language : 'en',
      },
      create: {
        sessionId: currentSessionId,
        userId,
        language: ['en', 'gu', 'hi'].includes(language) ? language : 'en',
      },
    });

    // Record user message
    await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: 'user',
        content: message.slice(0, 2000),
      },
    });

    // Call AI service
    const aiResult = await askVisaAssistant(
      message,
      history,
      chatSession.language as 'en' | 'gu' | 'hi'
    );

    // Record assistant message
    await prisma.chatMessage.create({
      data: {
        chatSessionId: chatSession.id,
        role: 'assistant',
        content: aiResult.reply,
        sourcesJson: JSON.stringify(aiResult.sources),
      },
    });

    return res.json({
      success: true,
      sessionId: currentSessionId,
      reply: aiResult.reply,
      language: aiResult.language,
      sources: aiResult.sources,
      disclaimer: aiResult.disclaimer,
      provider: aiResult.provider,
    });
  } catch (error: any) {
    console.error('AI chat route error:', error);
    return res.status(500).json({
      success: false,
      error: 'AI service temporarily unavailable. Please try again.',
      reply: 'We are experiencing high traffic. Please check the Visa Catalog directly or contact our consultants.',
      sources: [],
    });
  }
});

export default router;
