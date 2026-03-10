export interface TokenPayload {
    userId: string;
    accountId: string;
    type: string;
}
export declare class TokenService {
    private static readonly ACCESS_TOKEN_SECRET;
    private static readonly REFRESH_TOKEN_SECRET;
    private static readonly ACCESS_TOKEN_EXPIRES_IN;
    private static readonly REFRESH_TOKEN_EXPIRES_IN;
    static generateAccessToken(payload: TokenPayload): string;
    static generateRefreshToken(payload: TokenPayload): string;
    static verifyAccessToken(token: string): TokenPayload;
    static verifyRefreshToken(token: string): TokenPayload;
}
//# sourceMappingURL=token.service.d.ts.map