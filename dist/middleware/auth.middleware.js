"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const token_service_1 = require("../services/token.service");
const prisma_1 = require("../utils/prisma");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = token_service_1.TokenService.verifyAccessToken(token);
        // Check session in database
        const session = await prisma_1.prisma.session.findUnique({
            where: { accessToken: token }
        });
        if (!session) {
            return res.status(401).json({ message: 'Session expired or logged out' });
        }
        req.user = { id: payload.userId };
        req.account = { id: payload.accountId, type: payload.type };
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map