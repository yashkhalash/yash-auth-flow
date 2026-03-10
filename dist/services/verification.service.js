"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const prisma_1 = require("../utils/prisma");
const uuid_1 = require("uuid");
const crypto_1 = __importDefault(require("crypto"));
const email_service_1 = require("./email.service");
const mail_template_1 = require("../templates/mail.template");
class VerificationService {
    static async generateOTP(accountId, type = 'OTP') {
        const otp = crypto_1.default.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        return prisma_1.prisma.verificationToken.create({
            data: {
                accountId,
                type,
                token: otp,
                expiresAt,
            },
        });
    }
    static async generateLink(accountId, email, baseUrl, type = 'LINK', subject = 'Verify Your Email') {
        const token = (0, uuid_1.v4)();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        const verification = await prisma_1.prisma.verificationToken.create({
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
            ? mail_template_1.MailTemplateService.getLinkTemplate(link) // Ideally a specific reset template, but using existing for now
            : mail_template_1.MailTemplateService.getLinkTemplate(link);
        await email_service_1.EmailService.sendEmail(email, subject, html);
        return verification;
    }
    static async verifyToken(accountId, token, type) {
        const verificationEntry = await prisma_1.prisma.verificationToken.findFirst({
            where: {
                accountId,
                token,
                type,
                expiresAt: { gt: new Date() },
            },
        });
        if (!verificationEntry)
            return false;
        await prisma_1.prisma.verificationToken.delete({ where: { id: verificationEntry.id } });
        await prisma_1.prisma.account.update({
            where: { id: accountId },
            data: { isVerified: true },
        });
        return true;
    }
}
exports.VerificationService = VerificationService;
//# sourceMappingURL=verification.service.js.map