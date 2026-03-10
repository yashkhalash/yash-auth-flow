import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { AuthService } from './services/auth.service';
import { UserService } from './services/user.service';
import { TokenService } from './services/token.service';
import { authMiddleware } from './middleware/auth.middleware';
import { securityMiddleware } from './middleware/security.middleware';
import { upload } from './middleware/upload.middleware';
import path from 'path';

const app = express();
const router = express.Router();

app.use(express.json());

// Apply security middleware (helmet, rate limit)
securityMiddleware(router);
app.use('/api', router);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Public Routes
router.post('/register', async (req, res) => {
  try {
    const { email, password, fullName, type } = req.body;
    const result = await AuthService.register(email, password, fullName, type);
    const message = result.verificationMethod === 'LINK' 
      ? 'Registration successful. Verification link sent to email.' 
      : 'Registration successful. OTP sent to email.';
    res.json({ message, data: result });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, type } = req.body;
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    
    const result = await AuthService.login(email, password, type, deviceInfo, ipAddress);
    res.json({ message: 'Login successful', data: result });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

router.get('/verify', async (req, res) => {
  try {
    const { accountId, token } = req.query as { accountId: string, token: string };
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    
    // Links are always type 'LINK'
    const result = await AuthService.verifyToken(accountId, token, 'LINK', deviceInfo, ipAddress) as any;
    res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: #4CAF50;">Verification Successful!</h1>
        <p>Your account has been verified. You can now log in to the app.</p>
        <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; display: inline-block; text-align: left; margin-top: 20px;">
          <strong>Access Token:</strong> <code style="word-break: break-all;">${result.data.accessToken}</code><br><br>
          <strong>Refresh Token:</strong> <code style="word-break: break-all;">${result.data.refreshToken}</code>
        </div>
      </div>
    `);
  } catch (error: any) {
    res.status(400).send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: #F44336;">Verification Failed</h1>
        <p>${error.message}</p>
      </div>
    `);
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { accountId, token, type } = req.body;
    const deviceInfo = req.headers['user-agent'];
    const ipAddress = req.ip;
    const result = await AuthService.verifyToken(accountId, token, type, deviceInfo, ipAddress);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const payload = TokenService.verifyRefreshToken(refreshToken);
    const accessToken = TokenService.generateAccessToken(payload);
    res.json({ accessToken });
  } catch (error: any) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const { email, type } = req.body;
    const result = await AuthService.resendVerification(email, type);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email, type } = req.body;
    const result = await AuthService.forgotPassword(email, type);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, type, token, newPassword } = req.body;
    const result = await AuthService.resetPassword(email, type, token, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/reset-password', async (req, res) => {
  const { token, email, accountId } = req.query;
  res.send(`
    <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
      <h1 style="color: #2196F3;">Reset Your Password</h1>
      <p>Please use the following details in your reset password request:</p>
      <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; display: inline-block; text-align: left; margin-top: 20px;">
        <strong>Email:</strong> <code>${email}</code><br>
        <strong>Token:</strong> <code style="word-break: break-all;">${token}</code><br>
        <strong>Account ID:</strong> <code>${accountId}</code>
      </div>
      <p style="margin-top: 20px; color: #666;">Note: In a real app, this would be a form to enter your new password.</p>
    </div>
  `);
});

// Session Management
router.post('/logout', authMiddleware, async (req: any, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader.split(' ')[1];
    await AuthService.logout(token);
    res.json({ message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Profile Management
router.get('/profile', authMiddleware, async (req: any, res) => {
  try {
    const profile: any = await UserService.getProfile(req.user.id);
    if (profile) {
      profile.verificationType = profile.verificationType || process.env.VERIFICATION_TYPE || 'OTP';
      if (profile.profileImage) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        profile.profileImage = `${baseUrl}${profile.profileImage}`;
      }
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/profile/edit', authMiddleware, upload.single('profileImage'), async (req: any, res) => {
  try {
    const { fullName, verificationType } = req.body;
    const updateData: any = { fullName, verificationType };
    
    if (req.file) {
      updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
    }
    
    const updatedUser: any = await UserService.editProfile(req.user.id, updateData);
    if (updatedUser) {
      updatedUser.verificationType = updatedUser.verificationType || process.env.VERIFICATION_TYPE || 'OTP';
      if (updatedUser.profileImage) {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        updatedUser.profileImage = `${baseUrl}${updatedUser.profileImage}`;
      }
    }
    res.json({ message: 'Profile updated successfully', data: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/account/delete', authMiddleware, async (req: any, res) => {
  try {
    await UserService.deleteAccount(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`yash-auth-flow Example App running on http://localhost:${PORT}`);
});
