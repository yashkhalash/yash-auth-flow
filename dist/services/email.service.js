"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    static async sendEmail(to, subject, html) {
        try {
            const info = await this.transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                html,
            });
            return info;
        }
        catch (error) {
            console.error('Email sending failed:', error);
            throw new Error('Could not send email');
        }
    }
}
exports.EmailService = EmailService;
EmailService.transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});
//# sourceMappingURL=email.service.js.map