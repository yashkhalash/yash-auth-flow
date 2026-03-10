"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const prisma_1 = require("../utils/prisma");
class UserService {
    static async getProfile(userId) {
        return prisma_1.prisma.user.findUnique({
            where: { id: userId },
            include: {
                accounts: {
                    select: {
                        id: true,
                        type: true,
                        provider: true,
                        isVerified: true,
                        createdAt: true,
                    }
                }
            }
        });
    }
    static async editProfile(userId, data) {
        return prisma_1.prisma.user.update({
            where: { id: userId },
            data
        });
    }
    static async deleteAccount(userId) {
        // This will delete associated accounts and sessions due to onDelete: Cascade in schema
        return prisma_1.prisma.user.delete({
            where: { id: userId }
        });
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map