"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordService {
    static async hash(password) {
        return bcrypt_1.default.hash(password, this.SALT_ROUNDS);
    }
    static async compare(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
}
exports.PasswordService = PasswordService;
PasswordService.SALT_ROUNDS = 12;
//# sourceMappingURL=password.service.js.map