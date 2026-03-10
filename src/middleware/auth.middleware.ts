import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services/token.service';
import { prisma } from '../utils/prisma';

export interface AuthRequest extends Request {
  user?: any;
  account?: any;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = TokenService.verifyAccessToken(token);
    
    // Check session in database
    const session = await prisma.session.findUnique({
      where: { accessToken: token }
    });

    if (!session) {
      return res.status(401).json({ message: 'Session expired or logged out' });
    }

    req.user = { id: payload.userId };
    req.account = { id: payload.accountId, type: payload.type };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
