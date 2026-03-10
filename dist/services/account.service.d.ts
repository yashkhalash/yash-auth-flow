export declare class AccountService {
    static createAccount(userId: string, type: string, password?: string, provider?: string, providerAccountId?: string): Promise<{
        id: string;
        type: string;
        provider: string | null;
        providerAccountId: string | null;
        passwordHash: string | null;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }>;
    static findAccountByCredentials(email: string, type: string): Promise<({
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
    }) | null>;
    static getAccountsForUser(userId: string): Promise<{
        id: string;
        type: string;
        provider: string | null;
        providerAccountId: string | null;
        passwordHash: string | null;
        isVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
}
//# sourceMappingURL=account.service.d.ts.map