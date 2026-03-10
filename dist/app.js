"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const auth_service_1 = require("./services/auth.service");
const user_service_1 = require("./services/user.service");
const token_service_1 = require("./services/token.service");
const auth_middleware_1 = require("./middleware/auth.middleware");
const security_middleware_1 = require("./middleware/security.middleware");
const upload_middleware_1 = require("./middleware/upload.middleware");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const router = express_1.default.Router();
app.use(express_1.default.json());
// Apply security middleware (helmet, rate limit)
(0, security_middleware_1.securityMiddleware)(router);
app.use('/api', router);
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Public Routes
router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, type } = req.body;
        const result = await auth_service_1.AuthService.register(email, password, fullName, type);
        const message = result.verificationMethod === 'LINK'
            ? 'Registration successful. Verification link sent to email.'
            : 'Registration successful. OTP sent to email.';
        res.json({ message, data: result });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password, type } = req.body;
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip;
        const result = await auth_service_1.AuthService.login(email, password, type, deviceInfo, ipAddress);
        res.json({ message: 'Login successful', data: result });
    }
    catch (error) {
        res.status(401).json({ error: error.message });
    }
});
router.get('/verify', async (req, res) => {
    try {
        const { accountId, token } = req.query;
        const deviceInfo = req.headers['user-agent'];
        const ipAddress = req.ip;
        // Links are always type 'LINK'
        const result = await auth_service_1.AuthService.verifyToken(accountId, token, 'LINK', deviceInfo, ipAddress);
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
    }
    catch (error) {
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
        const result = await auth_service_1.AuthService.verifyToken(accountId, token, type, deviceInfo, ipAddress);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        const payload = token_service_1.TokenService.verifyRefreshToken(refreshToken);
        const accessToken = token_service_1.TokenService.generateAccessToken(payload);
        res.json({ accessToken });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
});
router.post('/resend-verification', async (req, res) => {
    try {
        const { email, type } = req.body;
        const result = await auth_service_1.AuthService.resendVerification(email, type);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, type } = req.body;
        const result = await auth_service_1.AuthService.forgotPassword(email, type);
        res.json(result);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.post('/reset-password', async (req, res) => {
    try {
        const { email, type, token, newPassword } = req.body;
        const result = await auth_service_1.AuthService.resetPassword(email, type, token, newPassword);
        res.json(result);
    }
    catch (error) {
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
router.post('/logout', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader.split(' ')[1];
        await auth_service_1.AuthService.logout(token);
        res.json({ message: 'Logged out successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Profile Management
router.get('/profile', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const profile = await user_service_1.UserService.getProfile(req.user.id);
        if (profile) {
            profile.verificationType = profile.verificationType || process.env.VERIFICATION_TYPE || 'OTP';
            if (profile.profileImage) {
                const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
                profile.profileImage = `${baseUrl}${profile.profileImage}`;
            }
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
router.put('/profile/edit', auth_middleware_1.authMiddleware, upload_middleware_1.upload.single('profileImage'), async (req, res) => {
    try {
        const { fullName, verificationType } = req.body;
        const updateData = { fullName, verificationType };
        if (req.file) {
            updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
        }
        const updatedUser = await user_service_1.UserService.editProfile(req.user.id, updateData);
        if (updatedUser) {
            updatedUser.verificationType = updatedUser.verificationType || process.env.VERIFICATION_TYPE || 'OTP';
            if (updatedUser.profileImage) {
                const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
                updatedUser.profileImage = `${baseUrl}${updatedUser.profileImage}`;
            }
        }
        res.json({ message: 'Profile updated successfully', data: updatedUser });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
router.delete('/account/delete', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        await user_service_1.UserService.deleteAccount(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`yash-auth-flow Example App running on http://localhost:${PORT}`);
});
//# sourceMappingURL=app.js.map