import { prisma } from '../utils/prisma';

export class UserService {
  static async getProfile(userId: string) {
    return prisma.user.findUnique({
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

  static async editProfile(userId: string, data: { fullName?: string, profileImage?: string, verificationType?: string }) {
    return prisma.user.update({
      where: { id: userId },
      data
    });
  }

  static async deleteAccount(userId: string) {
    // This will delete associated accounts and sessions due to onDelete: Cascade in schema
    return prisma.user.delete({
      where: { id: userId }
    });
  }
}
