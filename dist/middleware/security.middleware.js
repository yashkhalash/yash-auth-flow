"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.securityMiddleware = void 0;
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const securityMiddleware = (router) => {
    router.use((0, helmet_1.default)());
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per `window`
        standardHeaders: true,
        legacyHeaders: false,
    });
    router.use(limiter);
};
exports.securityMiddleware = securityMiddleware;
//# sourceMappingURL=security.middleware.js.map