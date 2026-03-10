"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailTemplateService = void 0;
class MailTemplateService {
    static getOTPTemplate(otp) {
        return `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Verification Code</h2>
        <p>Your yash-auth-flow verification code is:</p>
        <div style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 5px; margin: 20px 0;">
          ${otp}
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
      </div>
    `;
    }
    static getLinkTemplate(link) {
        return `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Verify Your Email</h2>
        <p>Please click the button below to verify your account:</p>
        <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0;">
          Verify Email
        </a>
        <p style="color: #666;">This link will expire in 24 hours.</p>
      </div>
    `;
    }
}
exports.MailTemplateService = MailTemplateService;
//# sourceMappingURL=mail.template.js.map