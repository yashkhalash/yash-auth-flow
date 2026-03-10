import { prisma } from '../utils/prisma';
import { PasswordService } from './password.service';

export class AccountService {
  static async createAccount(userId: string, type: string, password?: string, provider: string = 'credentials', providerAccountId?: string) {
    const passwordHash = password ? await PasswordService.hash(password) : null;
    
    return prisma.account.create({
      data: {
        userId,
        type,
        provider,
        providerAccountId,
        passwordHash,
      },
    });
  }

  static async findAccountByCredentials(email: string, type: string) {
    return prisma.account.findFirst({
      where: {
        type,
        user: { email },
      },
      include: { user: true },
    });
  }

  static async getAccountsForUser(userId: string) {
    return prisma.account.findMany({
      where: { userId },
    });
  }
}
