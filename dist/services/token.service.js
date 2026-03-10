"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class TokenService {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.ACCESS_TOKEN_SECRET, { expiresIn: this.ACCESS_TOKEN_EXPIRES_IN });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.REFRESH_TOKEN_SECRET, { expiresIn: this.REFRESH_TOKEN_EXPIRES_IN });
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, this.ACCESS_TOKEN_SECRET);
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.REFRESH_TOKEN_SECRET);
    }
}
exports.TokenService = TokenService;
TokenService.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access-secret';
TokenService.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh-secret';
TokenService.ACCESS_TOKEN_EXPIRES_IN = '15m';
TokenService.REFRESH_TOKEN_EXPIRES_IN = '7d';
//# sourceMappingURL=token.service.js.map