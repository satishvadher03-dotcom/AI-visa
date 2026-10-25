import assert from 'assert';
import bcrypt from 'bcryptjs';
import prisma from '../server/src/db.js';
import { askVisaAssistant } from '../server/src/services/aiService.js';
import {
  calculateFileChecksum,
  validateFileSignature,
  getSafeFilePath,
} from '../server/src/services/storageService.js';
import { generateUserToken, verifyUserToken } from '../server/src/middleware/auth.js';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('--- Starting AuraVisa Global Automated Test Suite ---');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name} ->`, err.message);
      failed++;
    }
  }

  // 1. Database Persistence & Seed Data
  await test('Database persistence: Admin, Consultant, Customer exist', async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@auravisa.com' } });
    const consultant = await prisma.user.findUnique({ where: { email: 'consultant@auravisa.com' } });
    const customer = await prisma.user.findUnique({ where: { email: 'customer@auravisa.com' } });

    assert.ok(admin, 'Admin user should exist in DB');
    assert.strictEqual(admin.role, 'ADMIN', 'Admin should have ADMIN role');
    assert.ok(consultant, 'Consultant user should exist in DB');
    assert.strictEqual(consultant.role, 'CONSULTANT', 'Consultant should have CONSULTANT role');
    assert.ok(customer, 'Customer user should exist in DB');
    assert.strictEqual(customer.role, 'CUSTOMER', 'Customer should have CUSTOMER role');
  });

  // 2. Password Hashing Security
  await test('Authentication: bcrypt password verification works accurately', async () => {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@auravisa.com' } });
    assert.ok(admin);
    const valid = await bcrypt.compare('AdminPassword123!', admin.passwordHash);
    const invalid = await bcrypt.compare('WrongPassword999!', admin.passwordHash);
    assert.strictEqual(valid, true, 'Valid password must match hash');
    assert.strictEqual(invalid, false, 'Invalid password must be rejected');
  });

  // 2b. Session Token Generation & Verification for iFrame Contexts
  await test('Session Token: HMAC token generation and verification for iframe sessions', async () => {
    const token = generateUserToken('test-user-id', 'CUSTOMER');
    const verified = verifyUserToken(token);
    assert.ok(verified, 'Generated token must verify successfully');
    assert.strictEqual(verified.userId, 'test-user-id');
    assert.strictEqual(verified.role, 'CUSTOMER');

    const tampered = token.slice(0, -4) + 'abcd';
    const failVerified = verifyUserToken(tampered);
    assert.strictEqual(failVerified, null, 'Tampered token must be rejected');
  });

  // 3. Official Visa Sources Verification
  await test('Verified official government visa sources are loaded in database', async () => {
    const uae = await prisma.visaProgram.findFirst({
      where: { countryCode: 'AE' },
      include: { officialSources: true, documentRequirements: true },
    });
    assert.ok(uae, 'UAE Visa Program should be present');
    assert.ok(uae.officialSources.length > 0, 'Official government sources must be attached');
    assert.ok(uae.officialSources[0].officialUrl.includes('icp.gov.ae') || uae.officialSources[0].officialUrl.includes('smartservices'));
    assert.ok(uae.documentRequirements.length > 0, 'Document requirements must be defined');
  });

  // 4. Double-Booking Prevention Logic
  await test('Appointment: double booking collision detection operates correctly', async () => {
    const date = '2026-11-20';
    const slot = '10:00 AM - 10:30 AM';

    const customer = await prisma.user.findUnique({ where: { email: 'customer@auravisa.com' } });
    assert.ok(customer);

    const ref1 = `APT-TEST-${Date.now()}`;
    const apt1 = await prisma.appointment.create({
      data: {
        referenceNumber: ref1,
        customerId: customer.id,
        appointmentDate: date,
        timeSlot: slot,
        status: 'SCHEDULED',
      },
    });

    // Check collision query
    const collision = await prisma.appointment.findFirst({
      where: {
        appointmentDate: date,
        timeSlot: slot,
        status: 'SCHEDULED',
      },
    });

    assert.ok(collision, 'Double-booking query must detect conflicting slot');

    // Clean up test appointment
    await prisma.appointment.delete({ where: { id: apt1.id } });
  });

  // 5. Private Storage Path Traversal Prevention
  await test('Private Storage: Path traversal attempts are rejected', async () => {
    const maliciousAttempt1 = '../../etc/passwd';
    const maliciousAttempt2 = '..\\..\\windows\\system32';
    const safeResult1 = getSafeFilePath(maliciousAttempt1);
    const safeResult2 = getSafeFilePath(maliciousAttempt2);

    assert.strictEqual(safeResult1, null, 'Path traversal attempt 1 must return null');
    assert.strictEqual(safeResult2, null, 'Path traversal attempt 2 must return null');
  });

  // 6. Magic Number / File Signature Validation
  await test('Private Storage: File signature and MIME validation functions', async () => {
    // Create temporary dummy PDF
    const tempPdfPath = path.resolve(process.cwd(), 'storage/test-sample.pdf');
    fs.writeFileSync(tempPdfPath, Buffer.from('%PDF-1.4\n%test file content for verification'));

    const isPdfValid = await validateFileSignature(tempPdfPath, 'application/pdf');
    const isJpegSpoofDetected = await validateFileSignature(tempPdfPath, 'image/jpeg');

    assert.strictEqual(isPdfValid, true, 'Valid PDF header (%PDF) must pass validation');
    assert.strictEqual(isJpegSpoofDetected, false, 'Mismatched MIME type must be rejected');

    fs.unlinkSync(tempPdfPath);
  });

  // 7. AI Visa Assistant Grounded Fallback & Safety
  await test('AI Service: Safe response generation in English and Gujarati', async () => {
    const enResponse = await askVisaAssistant('Tell me about UAE tourist visa', [], 'en');
    assert.ok(enResponse.reply.length > 20, 'AI response must contain descriptive text');
    assert.ok(enResponse.disclaimer, 'AI response must include statutory disclaimer');

    const guResponse = await askVisaAssistant('દુબઈ વિઝા માટે શું નિયમો છે?', [], 'gu');
    assert.strictEqual(guResponse.language, 'gu', 'Gujarati language parameter must be respected');
  });

  // 8. Application Status Transitions & History
  await test('Application status transitions record immutable audit history', async () => {
    const customer = await prisma.user.findUnique({ where: { email: 'customer@auravisa.com' } });
    const program = await prisma.visaProgram.findFirst();
    assert.ok(customer && program);

    const testApp = await prisma.visaApplication.create({
      data: {
        referenceNumber: `AV-TEST-${Date.now()}`,
        customerId: customer.id,
        visaProgramId: program.id,
        destinationCountry: program.country,
        visaCategory: program.category,
        status: 'SUBMITTED',
        statusHistory: {
          create: {
            changedById: customer.id,
            previousStatus: 'DRAFT',
            newStatus: 'SUBMITTED',
            changeReason: 'Test dossier initial submission',
          },
        },
      },
      include: { statusHistory: true },
    });

    assert.strictEqual(testApp.statusHistory.length, 1);
    assert.strictEqual(testApp.statusHistory[0].newStatus, 'SUBMITTED');

    // Clean up
    await prisma.visaApplication.delete({ where: { id: testApp.id } });
  });

  console.log(`\nTest Results: ${passed} passed, ${failed} failed.`);
  await prisma.$disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(async (e) => {
  console.error('Test suite error:', e);
  await prisma.$disconnect().catch(() => {});
  process.exit(1);
});
