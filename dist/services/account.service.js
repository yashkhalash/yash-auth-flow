"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const prisma_1 = require("../utils/prisma");
const password_service_1 = require("./password.service");
class AccountService {
    static async createAccount(userId, type, password, provider = 'credentials', providerAccountId) {
        const passwordHash = password ? await password_service_1.PasswordService.hash(password) : null;
        return prisma_1.prisma.account.create({
            data: {
                userId,
                type,
                provider,
                providerAccountId,
                passwordHash,
            },
        });
    }
    static async findAccountByCredentials(email, type) {
        return prisma_1.prisma.account.findFirst({
            where: {
                type,
                user: { email },
            },
            include: { user: true },
        });
    }
    static async getAccountsForUser(userId) {
        return prisma_1.prisma.account.findMany({
            where: { userId },
        });
    }
}
exports.AccountService = AccountService;
//# sourceMappingURL=account.service.js.map