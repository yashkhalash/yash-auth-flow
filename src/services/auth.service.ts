import { prisma } from '../utils/prisma';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { AccountService } from './account.service';
import { VerificationService } from './verification.service';
import { EmailService } from './email.service';
import { MailTemplateService } from '../templates/mail.template';

export class AuthService {
  static async register(email: string, password: string, fullName?: string, type: string = 'personal') {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({
        data: { email, fullName },
      });
    }

    const existingAccount = await prisma.account.findUnique({
      where: { userId_type: { userId: user.id, type } },
      include: { user: true }
    });

    if (existingAccount) {
      if (existingAccount.isVerified) {
        throw new Error('Account type already exists for this user');
      }
      // If not verified, allow re-registration by updating password
      const passwordHash = await PasswordService.hash(password);
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { passwordHash },
      });
      
      // Update User fullName if provided
      if (fullName) {
        await prisma.user.update({
          where: { id: user.id },
          data: { fullName }
        });
      }
      
      const verificationType = (existingAccount.user as any).verificationType || process.env.VERIFICATION_TYPE || 'OTP';
      if (verificationType === 'LINK') {
        const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
        await VerificationService.generateLink(existingAccount.id, email, `${baseUrl}/api`);
        return { user, account: existingAccount, verificationMethod: 'LINK' };
      } else {
        const verification = await VerificationService.generateOTP(existingAccount.id);
        const html = MailTemplateService.getOTPTemplate(verification.token);
        await EmailService.sendEmail(email, 'Your Verification Code', html);
        return { user, account: existingAccount, verificationMethod: 'OTP' };
      }
    }

    const account = await AccountService.createAccount(user.id, type, password);
    
    const verificationType = (user as any).verificationType || process.env.VERIFICATION_TYPE || 'OTP';
    
    if (verificationType === 'LINK') {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      await VerificationService.generateLink(account.id, email, `${baseUrl}/api`);
      return { user, account, verificationMethod: 'LINK' };
    } else {
      const verification = await VerificationService.generateOTP(account.id);
      const html = MailTemplateService.getOTPTemplate(verification.token);
      await EmailService.sendEmail(email, 'Your Verification Code', html);
      return { user, account, verificationMethod: 'OTP' };
    }
  }

  static async login(email: string, password: string, type: string, deviceInfo?: string, ipAddress?: string) {
    const account = await AccountService.findAccountByCredentials(email, type);

    if (!account || !account.passwordHash) {
      throw new Error('Invalid credentials');
    }

    const isValid = await PasswordService.compare(password, account.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const payload = { userId: account.userId, accountId: account.id, type: account.type };
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    const session = await prisma.session.create({
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

  static async logout(accessToken: string) {
    await prisma.session.deleteMany({
      where: { accessToken },
    });
  }

  static async verifyToken(accountId: string, token: string, type: 'OTP' | 'LINK' | 'RESET_PASSWORD', deviceInfo?: string, ipAddress?: string) {
    const isValid = await VerificationService.verifyToken(accountId, token, type);
    if (!isValid) {
      throw new Error('Invalid or expired verification token');
    }

    if (type === 'RESET_PASSWORD') {
      return { message: 'Reset token verified successfully' };
    }

    // After email verification, return login-style tokens
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      include: { user: true }
    });

    if (!account) throw new Error('Account not found');

    const payload = { userId: account.userId, accountId: account.id, type: account.type };
    const accessToken = TokenService.generateAccessToken(payload);
    const refreshToken = TokenService.generateRefreshToken(payload);

    const session = await prisma.session.create({
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

  static async resendVerification(email: string, type: string) {
    const account = await AccountService.findAccountByCredentials(email, type);
    if (!account) throw new Error('Account not found');
    if (account.isVerified) throw new Error('Account already verified');

    const verificationType = (account.user as any).verificationType || process.env.VERIFICATION_TYPE || 'OTP';

    if (verificationType === 'LINK') {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      await VerificationService.generateLink(account.id, email, `${baseUrl}/api`);
      return { message: 'New verification link sent to email', verificationMethod: 'LINK' };
    } else {
      const verification = await VerificationService.generateOTP(account.id);
      const html = MailTemplateService.getOTPTemplate(verification.token);
      await EmailService.sendEmail(email, 'Your Verification Code', html);
      return { message: 'New OTP sent to email', verificationMethod: 'OTP' };
    }
  }

  static async forgotPassword(email: string, type: string) {
    const account = await AccountService.findAccountByCredentials(email, type);
    if (!account) throw new Error('Account not found');

    const verificationType = (account.user as any).verificationType || process.env.VERIFICATION_TYPE || 'OTP';

    if (verificationType === 'LINK') {
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      await VerificationService.generateLink(account.id, email, `${baseUrl}/api`, 'RESET_PASSWORD', 'Password Reset Link');
      return { message: 'Reset link sent to email', verificationMethod: 'LINK' };
    } else {
      const otp = await VerificationService.generateOTP(account.id, 'RESET_PASSWORD');
      const html = MailTemplateService.getOTPTemplate(otp.token);
      await EmailService.sendEmail(email, 'Password Reset Code', html);
      return { message: 'Reset OTP sent to email', verificationMethod: 'OTP' };
    }
  }

  static async resetPassword(email: string, type: string, token: string, newPassword: string) {
    const account = await AccountService.findAccountByCredentials(email, type);
    if (!account) throw new Error('Account not found');

    const isValid = await VerificationService.verifyToken(account.id, token, 'RESET_PASSWORD');
    if (!isValid) throw new Error('Invalid or expired reset token');

    const passwordHash = await PasswordService.hash(newPassword);
    await prisma.account.update({
      where: { id: account.id },
      data: { passwordHash },
    });

    return { message: 'Password reset successful' };
  }
}
