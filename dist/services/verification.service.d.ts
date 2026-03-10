export declare class VerificationService {
    static generateOTP(accountId: string, type?: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        accountId: string;
    }>;
    static generateLink(accountId: string, email: string, baseUrl: string, type?: string, subject?: string): Promise<{
        id: string;
        type: string;
        createdAt: Date;
        token: string;
        expiresAt: Date;
        accountId: string;
    }>;
    static verifyToken(accountId: string, token: string, type: string): Promise<boolean>;
}
//# sourceMappingURL=verification.service.d.ts.map