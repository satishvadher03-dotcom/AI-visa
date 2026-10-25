import { Router } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../db.js';
import { logAuditEvent } from '../middleware/audit.js';
import { generateUserToken } from '../middleware/auth.js';

const router = Router();

// Register new user (Strictly CUSTOMER role only)
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, nationality } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'First name, last name, email, and password are required.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
      });
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'An account with this email address already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Security check: Force CUSTOMER role for public registration
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        role: 'CUSTOMER',
        status: 'ACTIVE',
        profile: {
          create: {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone ? phone.trim() : null,
            nationality: nationality ? nationality.trim() : 'Indian',
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // Establish server-side session
    req.session.userId = user.id;
    req.session.role = user.role;

    // Generate token for resilient iframe sessions
    const token = generateUserToken(user.id, user.role);

    await logAuditEvent(req, 'USER_REGISTER', 'USER', user.id, {
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      error: 'Registration failed due to a server error. Please try again.',
    });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required.',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { profile: true },
    });

    if (!user) {
      await logAuditEvent(req, 'AUTH_FAILED', 'USER', undefined, { email });
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    if (user.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: 'This account has been suspended. Please contact support.',
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      await logAuditEvent(req, 'AUTH_FAILED', 'USER', user.id, { email });
      return res.status(401).json({
        success: false,
        error: 'Invalid email address or password.',
      });
    }

    // Set session data
    req.session.userId = user.id;
    req.session.role = user.role;

    // Generate token for resilient iframe sessions
    const token = generateUserToken(user.id, user.role);

    await logAuditEvent(req, 'AUTH_SUCCESS', 'USER', user.id, {
      email: user.email,
      role: user.role,
    });

    return res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        profile: user.profile,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Login failed due to a server error.',
    });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  const userId = req.session?.userId || (req as any).user?.id;
  if (userId) {
    await logAuditEvent(req, 'AUTH_LOGOUT', 'USER', userId);
  }

  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: 'Could not log out.' });
    }
    res.clearCookie('auravisa.sid');
    return res.json({ success: true, message: 'Logged out successfully.' });
  });
});

// Get current session user
router.get('/me', async (req, res) => {
  // If user is already loaded by authenticateSession middleware:
  if (req.user) {
    const token = generateUserToken(req.user.id, req.user.role);
    return res.json({
      success: true,
      token,
      user: req.user,
    });
  }

  return res.json({
    success: true,
    user: null,
  });
});

// Password recovery / reset
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (user) {
    await logAuditEvent(req, 'PASSWORD_RESET_REQUEST', 'USER', user.id, { email });
  }

  // Consistent message to prevent email enumeration
  return res.json({
    success: true,
    message: 'If an account matches that email address, password reset instructions have been dispatched.',
  });
});

router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword || newPassword.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Valid email and a new password with at least 8 characters are required.',
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return res.status(404).json({ success: false, error: 'Account not found.' });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  await logAuditEvent(req, 'PASSWORD_RESET_COMPLETE', 'USER', user.id);

  return res.json({
    success: true,
    message: 'Password has been reset successfully. You may now log in.',
  });
});

export default router;
