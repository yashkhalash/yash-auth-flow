import { prisma } from '../utils/prisma';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { EmailService } from './email.service';
import { MailTemplateService } from '../templates/mail.template';

export class VerificationService {
  static async generateOTP(accountId: string, type: string = 'OTP') {
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    return prisma.verificationToken.create({
      data: {
        accountId,
        type,
        token: otp,
        expiresAt,
      },
    });
  }

  static async generateLink(accountId: string, email: string, baseUrl: string, type: string = 'LINK', subject: string = 'Verify Your Email') {
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const verification = await prisma.verificationToken.create({
      data: {
        accountId,
        type,
        token,
        expiresAt,
      },
    });

    // Send Link Email
    const endpoint = type === 'RESET_PASSWORD' ? 'reset-password' : 'verify';
    const link = `${baseUrl}/${endpoint}?token=${token}&accountId=${accountId}&email=${encodeURIComponent(email)}`;
    const html = type === 'RESET_PASSWORD' 
      ? MailTemplateService.getLinkTemplate(link) // Ideally a specific reset template, but using existing for now
      : MailTemplateService.getLinkTemplate(link);
      
    await EmailService.sendEmail(email, subject, html);

    return verification;
  }

  static async verifyToken(accountId: string, token: string, type: string) {
    const verificationEntry = await prisma.verificationToken.findFirst({
      where: {
        accountId,
        token,
        type,
        expiresAt: { gt: new Date() },
      },
    });

    if (!verificationEntry) return false;

    await prisma.verificationToken.delete({ where: { id: verificationEntry.id } });
    await prisma.account.update({
      where: { id: accountId },
      data: { isVerified: true },
    });

    return true;
  }
}
