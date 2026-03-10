"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../utils/prisma");
const password_service_1 = require("./password.service");
const token_service_1 = require("./token.service");
const account_service_1 = require("./account.service");
const verification_service_1 = require("./verification.service");
const email_service_1 = require("./email.service");
const mail_template_1 = require("../templates/mail.template");
class AuthService {
    static async register(email, password, fullName, type = 'personal') {
        let user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma_1.prisma.user.create({
                data: { email, fullName },
            });
        }
        const existingAccount = await prisma_1.prisma.account.findUnique({
            where: { userId_type: { userId: user.id, type } },
            include: { user: true }
        });
        if (existingAccount) {
            if (existingAccount.isVerified) {
                throw new Error('Account type already exists for this user');
            }
            // If not verified, allow re-registration by updating password
            const passwordHash = await password_service_1.PasswordService.hash(password);
            await prisma_1.prisma.account.update({
                where: { id: existingAccount.id },
                data: { passwordHash },
            });
            // Update User fullName if provided
            if (fullName) {
                await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { fullName }
                });
            }
            const verificationType = existingAccount.user.verificationType || process.env.VERIFICATION_TYPE || 'OTP';
            if (verificationType === 'LINK') {
                const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
                await verification_service_1.VerificationService.generateLink(existingAccount.id, email, `${baseUrl}/api`);
                return { user, account: existingAccount, verificationMethod: 'LINK' };
            }
            else {
                const verification = await verification_service_1.VerificationService.generateOTP(existingAccount.id);
                const html = mail_template_1.MailTemplateService.getOTPTemplate(verification.token);
                await email_service_1.EmailService.sendEmail(email, 'Your Verification Code', html);
                return { user, account: existingAccount, verificationMethod: 'OTP' };
            }
        }
        const account = await account_service_1.AccountService.createAccount(user.id, type, password);
        const verificationType = user.verificationType || process.env.VERIFICATION_TYPE || 'OTP';
        if (verificationType === 'LINK') {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            await verification_service_1.VerificationService.generateLink(account.id, email, `${baseUrl}/api`);
            return { user, account, verificationMethod: 'LINK' };
        }
        else {
            const verification = await verification_service_1.VerificationService.generateOTP(account.id);
            const html = mail_template_1.MailTemplateService.getOTPTemplate(verification.token);
            await email_service_1.EmailService.sendEmail(email, 'Your Verification Code', html);
            return { user, account, verificationMethod: 'OTP' };
        }
    }
    static async login(email, password, type, deviceInfo, ipAddress) {
        const account = await account_service_1.AccountService.findAccountByCredentials(email, type);
        if (!account || !account.passwordHash) {
            throw new Error('Invalid credentials');
        }
        const isValid = await password_service_1.PasswordService.compare(password, account.passwordHash);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        const payload = { userId: account.userId, accountId: account.id, type: account.type };
        const accessToken = token_service_1.TokenService.generateAccessToken(payload);
        const refreshToken = token_service_1.TokenService.generateRefreshToken(payload);
        const session = await prisma_1.prisma.session.create({
            data: {
                userId: account.userId,
                accessToken,
                refreshToken,
                deviceInfo,
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        return { account, session, accessToken, refreshToken };
    }
    static async logout(accessToken) {
        await prisma_1.prisma.session.deleteMany({
            where: { accessToken },
        });
    }
    static async verifyToken(accountId, token, type, deviceInfo, ipAddress) {
        const isValid = await verification_service_1.VerificationService.verifyToken(accountId, token, type);
        if (!isValid) {
            throw new Error('Invalid or expired verification token');
        }
        if (type === 'RESET_PASSWORD') {
            return { message: 'Reset token verified successfully' };
        }
        // After email verification, return login-style tokens
        const account = await prisma_1.prisma.account.findUnique({
            where: { id: accountId },
            include: { user: true }
        });
        if (!account)
            throw new Error('Account not found');
        const payload = { userId: account.userId, accountId: account.id, type: account.type };
        const accessToken = token_service_1.TokenService.generateAccessToken(payload);
        const refreshToken = token_service_1.TokenService.generateRefreshToken(payload);
        const session = await prisma_1.prisma.session.create({
            data: {
                userId: account.userId,
                accessToken,
                refreshToken,
                deviceInfo,
                ipAddress,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
        return {
            message: 'Account verified successfully',
            data: { account, session, accessToken, refreshToken }
        };
    }
    static async resendVerification(email, type) {
        const account = await account_service_1.AccountService.findAccountByCredentials(email, type);
        if (!account)
            throw new Error('Account not found');
        if (account.isVerified)
            throw new Error('Account already verified');
        const verificationType = account.user.verificationType || process.env.VERIFICATION_TYPE || 'OTP';
        if (verificationType === 'LINK') {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            await verification_service_1.VerificationService.generateLink(account.id, email, `${baseUrl}/api`);
            return { message: 'New verification link sent to email', verificationMethod: 'LINK' };
        }
        else {
            const verification = await verification_service_1.VerificationService.generateOTP(account.id);
            const html = mail_template_1.MailTemplateService.getOTPTemplate(verification.token);
            await email_service_1.EmailService.sendEmail(email, 'Your Verification Code', html);
            return { message: 'New OTP sent to email', verificationMethod: 'OTP' };
        }
    }
    static async forgotPassword(email, type) {
        const account = await account_service_1.AccountService.findAccountByCredentials(email, type);
        if (!account)
            throw new Error('Account not found');
        const verificationType = account.user.verificationType || process.env.VERIFICATION_TYPE || 'OTP';
        if (verificationType === 'LINK') {
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            await verification_service_1.VerificationService.generateLink(account.id, email, `${baseUrl}/api`, 'RESET_PASSWORD', 'Password Reset Link');
            return { message: 'Reset link sent to email', verificationMethod: 'LINK' };
        }
        else {
            const otp = await verification_service_1.VerificationService.generateOTP(account.id, 'RESET_PASSWORD');
            const html = mail_template_1.MailTemplateService.getOTPTemplate(otp.token);
            await email_service_1.EmailService.sendEmail(email, 'Password Reset Code', html);
            return { message: 'Reset OTP sent to email', verificationMethod: 'OTP' };
        }
    }
    static async resetPassword(email, type, token, newPassword) {
        const account = await account_service_1.AccountService.findAccountByCredentials(email, type);
        if (!account)
            throw new Error('Account not found');
        const isValid = await verification_service_1.VerificationService.verifyToken(account.id, token, 'RESET_PASSWORD');
        if (!isValid)
            throw new Error('Invalid or expired reset token');
        const passwordHash = await password_service_1.PasswordService.hash(newPassword);
        await prisma_1.prisma.account.update({
            where: { id: account.id },
            data: { passwordHash },
        });
        return { message: 'Password reset successful' };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map