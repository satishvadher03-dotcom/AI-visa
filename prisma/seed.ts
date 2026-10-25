import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding AuraVisa Global database...');

  // 1. Password hashes
  const adminPassword = await bcrypt.hash('AdminPassword123!', 10);
  const consultantPassword = await bcrypt.hash('Consultant123!', 10);
  const customerPassword = await bcrypt.hash('Customer123!', 10);

  // 2. Create Users
  const admin = await prisma.user.upsert({
    where: { email: 'admin@auravisa.com' },
    update: { passwordHash: adminPassword },
    create: {
      email: 'admin@auravisa.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'AuraVisa',
          lastName: 'Director',
          phone: '+91 98765 00001',
          nationality: 'Indian',
          city: 'Mumbai',
          country: 'India',
        },
      },
    },
  });

  const consultant = await prisma.user.upsert({
    where: { email: 'consultant@auravisa.com' },
    update: { passwordHash: consultantPassword },
    create: {
      email: 'consultant@auravisa.com',
      passwordHash: consultantPassword,
      role: 'CONSULTANT',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Rajesh',
          lastName: 'Patel',
          phone: '+91 98765 00002',
          nationality: 'Indian',
          city: 'Ahmedabad',
          country: 'India',
        },
      },
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@auravisa.com' },
    update: { passwordHash: customerPassword },
    create: {
      email: 'customer@auravisa.com',
      passwordHash: customerPassword,
      role: 'CUSTOMER',
      status: 'ACTIVE',
      profile: {
        create: {
          firstName: 'Priya',
          lastName: 'Sharma',
          phone: '+91 98765 00003',
          nationality: 'Indian',
          passportNumber: 'Z8765432',
          city: 'New Delhi',
          country: 'India',
        },
      },
    },
  });

  // 3. Create Visa Programs with Official Government Sources & Document Requirements
  const visaProgramsData = [
    {
      title: 'United Arab Emirates 30-Day Tourist eVisa',
      country: 'United Arab Emirates',
      countryCode: 'AE',
      flagEmoji: '🇦🇪',
      category: 'TOURIST',
      flow: 'INDIA_TO_WORLD',
      processingTime: '24-72 Hours',
      validity: '30 Days from entry',
      entryType: 'Single Entry',
      feeAmount: 95.0,
      feeCurrency: 'USD',
      description: 'Official electronic tourist visa for leisure, family visit, or transit in Dubai, Abu Dhabi, and all UAE emirates.',
      eligibilitySummary: 'Valid passport with minimum 6 months validity. Confirmed return flight and accommodation required upon arrival.',
      officialPortalUrl: 'https://smartservices.icp.gov.in/',
      isPopular: true,
      officialSources: [
        {
          authorityName: 'Federal Authority for Identity, Citizenship, Customs and Port Security (ICP UAE)',
          officialUrl: 'https://smartservices.icp.gov.in/',
          lastVerifiedDate: '2026-10-15',
          notes: 'Official UAE federal visa portal for international visitors.',
          isOfficialGovernment: true,
        },
      ],
      requirements: [
        {
          title: 'Passport Bio-Data Page Scan',
          description: 'Clear color copy of front & back page. Minimum 6 months validity remaining.',
          isMandatory: true,
          allowedMimeTypes: 'image/jpeg,image/png,application/pdf',
          maxSizeBytes: 5242880,
        },
        {
          title: 'Recent Passport-size Photograph',
          description: 'White background, 35x45mm, clear face without headwear (except religious).',
          isMandatory: true,
          allowedMimeTypes: 'image/jpeg,image/png',
          maxSizeBytes: 3145728,
        },
        {
          title: 'Return Flight Ticket Reservation',
          description: 'Confirmed round-trip airline ticket booking.',
          isMandatory: false,
          allowedMimeTypes: 'application/pdf,image/jpeg',
          maxSizeBytes: 5242880,
        },
      ],
    },
    {
      title: 'Republic of India 30-Day Tourist e-Visa',
      country: 'India',
      countryCode: 'IN',
      flagEmoji: '🇮🇳',
      category: 'TOURIST',
      flow: 'WORLD_TO_INDIA',
      processingTime: '72-96 Hours',
      validity: '30 Days (Double Entry)',
      entryType: 'Double Entry',
      feeAmount: 25.0,
      feeCurrency: 'USD',
      description: 'Official Government of India e-Visa for foreign nationals visiting India for tourism, recreation, and visiting friends/relatives.',
      eligibilitySummary: 'Foreign nationals holding eligible passports with at least 6 months validity and two blank pages.',
      officialPortalUrl: 'https://indianvisaonline.gov.in/evisa/tvoa.html',
      isPopular: true,
      officialSources: [
        {
          authorityName: 'Bureau of Immigration, Ministry of Home Affairs, Government of India',
          officialUrl: 'https://indianvisaonline.gov.in/evisa/tvoa.html',
          lastVerifiedDate: '2026-10-20',
          notes: 'Sole official Government of India portal for e-Visa issuance.',
          isOfficialGovernment: true,
        },
      ],
      requirements: [
        {
          title: 'Passport Bio Page Scan',
          description: 'PDF format (10 KB to 300 KB) containing applicant personal particulars.',
          isMandatory: true,
          allowedMimeTypes: 'application/pdf',
          maxSizeBytes: 2097152,
        },
        {
          title: 'Digital Facial Photograph',
          description: 'JPEG image with white background, square aspect ratio (minimum 350x350 pixels).',
          isMandatory: true,
          allowedMimeTypes: 'image/jpeg',
          maxSizeBytes: 1048576,
        },
      ],
    },
    {
      title: 'United Kingdom Standard Visitor Visa',
      country: 'United Kingdom',
      countryCode: 'GB',
      flagEmoji: '🇬🇧',
      category: 'TOURIST',
      flow: 'INDIA_TO_WORLD',
      processingTime: '3-6 Weeks',
      validity: '6 Months (Multiple Entry)',
      entryType: 'Multiple Entry',
      feeAmount: 150.0,
      feeCurrency: 'GBP',
      description: 'Comprehensive visitor visa application for holiday, business meetings, short courses, or family visits in England, Scotland, Wales, and Northern Ireland.',
      eligibilitySummary: 'Genuine intention to visit, proof of sufficient financial funds without public recourse, and established ties to home country.',
      officialPortalUrl: 'https://www.gov.uk/standard-visitor',
      isPopular: true,
      officialSources: [
        {
          authorityName: 'UK Visas and Immigration (UKVI), Home Office',
          officialUrl: 'https://www.gov.uk/standard-visitor',
          lastVerifiedDate: '2026-10-18',
          notes: 'Official UK Government visa information and online application service.',
          isOfficialGovernment: true,
        },
      ],
      requirements: [
        {
          title: 'Original Passport Bio-data Copy',
          description: 'Valid passport with at least 6 months validity and blank visa pages.',
          isMandatory: true,
          allowedMimeTypes: 'application/pdf,image/jpeg',
          maxSizeBytes: 5242880,
        },
        {
          title: 'Bank Statements (Past 6 Months)',
          description: 'Official bank statements showing regular income and liquid funds for the trip.',
          isMandatory: true,
          allowedMimeTypes: 'application/pdf',
          maxSizeBytes: 10485760,
        },
        {
          title: 'Employment Letter / Payslips',
          description: 'No Objection Certificate (NOC) from employer with approved leave dates.',
          isMandatory: true,
          allowedMimeTypes: 'application/pdf',
          maxSizeBytes: 5242880,
        },
        {
          title: 'Accommodation & Travel Plan',
          description: 'Hotel bookings, host invitation letter, or planned travel itinerary.',
          isMandatory: false,
          allowedMimeTypes: 'application/pdf',
          maxSizeBytes: 5242880,
        },
      ],
    },
    {
      title: 'Schengen Visitor Visa (France & Europe)',
      country: 'France',
      countryCode: 'FR',
      flagEmoji: '🇫🇷',
      category: 'TOURIST',
      flow: 'INDIA_TO_WORLD',
      processingTime: '15-20 Days',
      validity: 'Up to 90 Days within 180 Days',
      entryType: 'Short Stay Uniform Visa',
      feeAmount: 90.0,
      feeCurrency: 'EUR',
      description: 'Uniform Schengen Short-Stay Visa allowing travel across all 29 European Schengen member states.',
      eligibilitySummary: 'Requires comprehensive itinerary, confirmed round-trip flights, compliant travel insurance (€30,000 cover), and proof of ties.',
      officialPortalUrl: 'https://france-visas.gouv.fr/',
      isPopular: true,
      officialSources: [
        {
          authorityName: 'France-Visas Official Portal (Government of France)',
          officialUrl: 'https://france-visas.gouv.fr/',
          lastVerifiedDate: '2026-10-12',
          notes: 'Official portal for France and overseas territories visa applications.',
          isOfficialGovernment: true,
        },
      ],
      requirements: [
        {
          title: 'Passport Scan',
          description: 'Passport issued within the last 10 years with at least 3 months validity beyond intended departure from Schengen area.',
          isMandatory: true,
          allowedMimeTypes: 'application/pdf,image/jpeg',
          maxSizeBytes: 5242880,
        },
        {
          title: 'Schengen Travel Health Insurance',
          description: 'Minimum coverage of €30,000 for emergency medical and repatriation valid across all Schengen countries.',
          isMandatory: true,
          allowedMimeTypes: 'application/pdf',
          maxSizeBytes: 5242880,
        },
        {
          title: 'Proof of Financial Means (3 Months Bank Statements & ITR)',
          description: 'Bank statements stamped by bank + Income Tax Returns (ITR-V) for past 2 years.',
          isMandatory: true,
          allowedMimeTypes: 'application/pdf',
          maxSizeBytes: 10485760,
        },
      ],
    },
    {
      title: 'Singapore Electronic Visa (e-Visa)',
      country: 'Singapore',
      countryCode: 'SG',
      flagEmoji: '🇸🇬',
      category: 'TOURIST',
      flow: 'INDIA_TO_WORLD',
      processingTime: '3-5 Business Days',
      validity: '30 Days to 2 Years Multiple Entry',
      entryType: 'Multiple Entry',
      feeAmount: 30.0,
      feeCurrency: 'SGD',
      description: 'Authorized Singapore entry visa for social and business visits submitted through authorized visa agents.',
      eligibilitySummary: 'Indian passport holders require a visa prior to travel to Singapore. Complete SG Arrival Card within 3 days of entry.',
      officialPortalUrl: 'https://eservices.ica.gov.sg/esvclandingpage/save',
      isPopular: true,
      officialSources: [
        {
          authorityName: 'Immigration & Checkpoints Authority (ICA) Singapore',
          officialUrl: 'https://www.ica.gov.sg/enter-transit-depart/entering-singapore/visa_requirements',
          lastVerifiedDate: '2026-10-22',
          notes: 'Official Singapore Government immigration statutory board.',
          isOfficialGovernment: true,
        },
      ],
      requirements: [
        {
          title: 'Passport Biodata Copy',
          description: 'At least 6 months validity from date of entry.',
          isMandatory: true,
          allowedMimeTypes: 'application/pdf,image/jpeg',
          maxSizeBytes: 5242880,
        },
        {
          title: 'Color Passport Photo',
          description: 'Taken within last 3 months, plain white background, matt or semi-matt finish.',
          isMandatory: true,
          allowedMimeTypes: 'image/jpeg',
          maxSizeBytes: 2097152,
        },
      ],
    },
    {
      title: 'Vietnam 90-Day Multiple Entry e-Visa',
      country: 'Vietnam',
      countryCode: 'VN',
      flagEmoji: '🇻🇳',
      category: 'TOURIST',
      flow: 'INDIA_TO_WORLD',
      processingTime: '3-5 Working Days',
      validity: '90 Days (Multiple Entry)',
      entryType: 'Multiple Entry',
      feeAmount: 50.0,
      feeCurrency: 'USD',
      description: 'Official Government of Vietnam electronic visa for citizens of all countries and territories.',
      eligibilitySummary: 'Foreign passport valid for at least 6 months. Applicable at 42 international border gates across Vietnam.',
      officialPortalUrl: 'https://evisa.xuatnhapcanh.gov.vn/',
      isPopular: true,
      officialSources: [
        {
          authorityName: 'Vietnam Immigration Department, Ministry of Public Security',
          officialUrl: 'https://evisa.xuatnhapcanh.gov.vn/',
          lastVerifiedDate: '2026-10-14',
          notes: 'Official national e-Visa platform of the Socialist Republic of Vietnam.',
          isOfficialGovernment: true,
        },
      ],
      requirements: [
        {
          title: 'Passport Full Biodata Page',
          description: 'Clear photograph or scan showing ICAO lines and portrait.',
          isMandatory: true,
          allowedMimeTypes: 'image/jpeg,image/png',
          maxSizeBytes: 4194304,
        },
        {
          title: 'Portrait Photo (4x6 cm)',
          description: 'White background, looking directly at camera, no glasses or headwear.',
          isMandatory: true,
          allowedMimeTypes: 'image/jpeg,image/png',
          maxSizeBytes: 2097152,
        },
      ],
    },
  ];

  for (const prog of visaProgramsData) {
    const existing = await prisma.visaProgram.findFirst({
      where: { title: prog.title },
    });

    if (!existing) {
      const created = await prisma.visaProgram.create({
        data: {
          title: prog.title,
          country: prog.country,
          countryCode: prog.countryCode,
          flagEmoji: prog.flagEmoji,
          category: prog.category,
          flow: prog.flow,
          processingTime: prog.processingTime,
          validity: prog.validity,
          entryType: prog.entryType,
          feeAmount: prog.feeAmount,
          feeCurrency: prog.feeCurrency,
          description: prog.description,
          eligibilitySummary: prog.eligibilitySummary,
          officialPortalUrl: prog.officialPortalUrl,
          isPopular: prog.isPopular,
          isActive: true,
          officialSources: {
            create: prog.officialSources.map((s) => ({
              country: prog.country,
              authorityName: s.authorityName,
              officialUrl: s.officialUrl,
              lastVerifiedDate: s.lastVerifiedDate,
              notes: s.notes,
              isOfficialGovernment: s.isOfficialGovernment,
            })),
          },
          documentRequirements: {
            create: prog.requirements.map((r) => ({
              title: r.title,
              description: r.description,
              isMandatory: r.isMandatory,
              allowedMimeTypes: r.allowedMimeTypes,
              maxSizeBytes: r.maxSizeBytes,
            })),
          },
        },
      });

      // If it's the UAE visa, create a sample application for customer
      if (prog.countryCode === 'AE') {
        const application = await prisma.visaApplication.create({
          data: {
            referenceNumber: 'AV-2026-98124',
            customerId: customer.id,
            visaProgramId: created.id,
            destinationCountry: 'United Arab Emirates',
            visaCategory: 'TOURIST',
            status: 'UNDER_REVIEW',
            submissionDate: new Date('2026-10-20T10:30:00Z'),
            travelDate: new Date('2026-12-15T00:00:00Z'),
            applicantNotes: 'Traveling for family holiday in Dubai. Requires express processing assistance.',
            assignments: {
              create: {
                consultantId: consultant.id,
                assignedById: admin.id,
                notes: 'Assigned to senior Dubai specialist Rajesh Patel for expedited verification.',
                isActive: true,
              },
            },
            statusHistory: {
              createMany: {
                data: [
                  {
                    changedById: customer.id,
                    previousStatus: 'DRAFT',
                    newStatus: 'SUBMITTED',
                    changeReason: 'Application submitted with passport copy.',
                    createdAt: new Date('2026-10-20T10:30:00Z'),
                  },
                  {
                    changedById: consultant.id,
                    previousStatus: 'SUBMITTED',
                    newStatus: 'UNDER_REVIEW',
                    changeReason: 'Assigned consultant reviewed passport validity (7 months remaining).',
                    createdAt: new Date('2026-10-21T09:15:00Z'),
                  },
                ],
              },
            },
            caseNotes: {
              create: {
                authorId: consultant.id,
                noteText: 'Applicant confirmed return date on Dec 28. Passport scan resolution verified.',
                isConfidential: true,
              },
            },
          },
        });

        // Add an appointment
        await prisma.appointment.create({
          data: {
            referenceNumber: 'APT-84912',
            customerId: customer.id,
            consultantId: consultant.id,
            applicationId: application.id,
            serviceType: 'VIDEO_CONSULTATION',
            appointmentDate: '2026-10-28',
            timeSlot: '11:00 AM - 11:30 AM',
            status: 'SCHEDULED',
            notes: 'Pre-submission document verification and itinerary review.',
            meetingLink: 'https://auravisa.com/secure-consult/room-98124',
          },
        });
      }
    }
  }

  // Sample Enquiry
  await prisma.enquiry.create({
    data: {
      userId: customer.id,
      fullName: 'Priya Sharma',
      email: 'customer@auravisa.com',
      phone: '+91 98765 00003',
      nationality: 'Indian',
      destinationCountry: 'United Kingdom',
      visaType: 'TOURIST',
      message: 'Inquiring about required financial proof for 3-week vacation in London & Edinburgh.',
      status: 'IN_PROGRESS',
    },
  });

  // Sample Audit Log
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_INITIALIZATION',
      resourceType: 'SYSTEM',
      ipAddress: '127.0.0.1',
      detailsJson: JSON.stringify({ message: 'AuraVisa Global database initialized with verified government sources.' }),
    },
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
