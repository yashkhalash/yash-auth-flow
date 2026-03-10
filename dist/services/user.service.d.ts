export declare class UserService {
    static getProfile(userId: string): Promise<({
        accounts: {
            id: string;
            type: string;
            provider: string | null;
            isVerified: boolean;
            createdAt: Date;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string | null;
        profileImage: string | null;
        verificationType: string | null;
    }) | null>;
    static editProfile(userId: string, data: {
        fullName?: string;
        profileImage?: string;
        verificationType?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string | null;
        profileImage: string | null;
        verificationType: string | null;
    }>;
    static deleteAccount(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        fullName: string | null;
        profileImage: string | null;
        verificationType: string | null;
    }>;
}
//# sourceMappingURL=user.service.d.ts.map