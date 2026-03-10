export declare class AuthService {
    static register(email: string, password: string, fullName?: string, type?: string): Promise<{
        user: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            fullName: string | null;
            profileImage: string | null;
            verificationType: string | null;
        };
        account: {
            id: string;
            type: string;
            provider: string | null;
            providerAccountId: string | null;
            passwordHash: string | null;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        };
        verificationMethod: string;
    }>;
    static login(email: string, password: string, type: string, deviceInfo?: string, ipAddress?: string): Promise<{
        account: {
            user: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string;
                fullName: string | null;
                profileImage: string | null;
                verificationType: string | null;
            };
        } & {
            id: string;
            type: string;
            provider: string | null;
            providerAccountId: string | null;
            passwordHash: string | null;
            isVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
        };
        session: {
            id: string;
            createdAt: Date;
            userId: string;
            expiresAt: Date;
            deviceInfo: string | null;
            ipAddress: string | null;
            accessToken: string;
            refreshToken: string;
        };
        accessToken: string;
        refreshToken: string;
    }>;
    static logout(accessToken: string): Promise<void>;
    static verifyToken(accountId: string, token: string, type: 'OTP' | 'LINK' | 'RESET_PASSWORD', deviceInfo?: string, ipAddress?: string): Promise<{
        message: string;
        data?: undefined;
    } | {
        message: string;
        data: {
            account: {
                user: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    email: string;
                    fullName: string | null;
                    profileImage: string | null;
                    verificationType: string | null;
                };
            } & {
                id: string;
                type: string;
                provider: string | null;
                providerAccountId: string | null;
                passwordHash: string | null;
                isVerified: boolean;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
            };
            session: {
                id: string;
                createdAt: Date;
                userId: string;
                expiresAt: Date;
                deviceInfo: string | null;
                ipAddress: string | null;
                accessToken: string;
                refreshToken: string;
            };
            accessToken: string;
            refreshToken: string;
        };
    }>;
    static resendVerification(email: string, type: string): Promise<{
        message: string;
        verificationMethod: string;
    }>;
    static forgotPassword(email: string, type: string): Promise<{
        message: string;
        verificationMethod: string;
    }>;
    static resetPassword(email: string, type: string, token: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map