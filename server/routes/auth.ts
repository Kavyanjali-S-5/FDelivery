import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db.ts';
import { generateToken, authenticateToken, AuthenticatedRequest } from '../middleware/auth.ts';
import { sendLoginNotificationEmail } from '../email.ts';

export const authRouter = Router();

// Register new customer
authRouter.post('/register', async (req, res): Promise<void> => {
  try {
    const { email, password, confirmPassword, fullName, phone, address, city, zip } = req.body;

    // Field 1: Name
    if (!fullName || !fullName.trim()) {
      res.status(400).json({ error: 'Full name is required.' });
      return;
    }

    // Field 2: Email Address
    if (!email || !email.trim()) {
      res.status(400).json({ error: 'Email address is required.' });
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    // Field 3: Phone Number
    if (!phone || !phone.trim()) {
      res.status(400).json({ error: 'Phone number is required.' });
      return;
    }

    // Field 4: Password
    if (!password || password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      return;
    }

    // Field 5: Re-enter Password validation
    if (confirmPassword !== undefined && password !== confirmPassword) {
      res.status(400).json({ error: 'Password and Re-enter Password do not match.' });
      return;
    }

    // Field 6: Delivery Address
    if (!address || !address.trim()) {
      res.status(400).json({ error: 'Delivery address is required.' });
      return;
    }

    // Field 7: City
    if (!city || !city.trim()) {
      res.status(400).json({ error: 'City is required.' });
      return;
    }

    // Field 8: ZIP Code
    if (!zip || !zip.trim()) {
      res.status(400).json({ error: 'ZIP code is required.' });
      return;
    }

    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    // Optional admin email check from environment variable
    const adminEmails = (process.env.ADMIN_EMAILS || 'admin@fdelivery.com')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'customer';

    const newUser = await db.createUser({
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      password_hash,
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      zip: zip.trim(),
      role,
    });

    const token = generateToken(newUser);

    // Do not return password hash
    const { password_hash: _, ...safeUser } = newUser;

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('[Auth] Registration error:', err);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
});

// Login
authRouter.post('/login', async (req, res): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await db.findUserByEmail(email);
    if (!user) {
      // Do not send login notification emails for failed login attempts
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Do not send login notification emails for failed login attempts
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user);
    const { password_hash: _, ...safeUser } = user;

    // Send email notification asynchronously; failures do not block the login response
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.ip || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    sendLoginNotificationEmail(user, {
      ip: clientIp,
      userAgent,
      timestamp: new Date(),
    }).catch((emailErr) => {
      console.warn('[Auth] Non-blocking email notification error:', emailErr?.message || emailErr);
    });

    res.json({
      message: 'Signed in successfully!',
      token,
      user: safeUser,
    });
  } catch (err: any) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Server error during sign in. Please try again.' });
  }
});

// Get current profile
authRouter.get('/me', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  const { password_hash: _, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// Update profile details
authRouter.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { full_name, phone, address, city, zip } = req.body;
    const updated = await db.updateUserProfile(req.user.id, {
      full_name: full_name?.trim() || req.user.full_name,
      phone: phone !== undefined ? phone.trim() : req.user.phone,
      address: address !== undefined ? address.trim() : req.user.address,
      city: city !== undefined ? city.trim() : req.user.city,
      zip: zip !== undefined ? zip.trim() : req.user.zip,
    });

    if (!updated) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    const { password_hash: _, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully!', user: safeUser });
  } catch (err: any) {
    console.error('[Auth] Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});
