import jwt, { type SignOptions } from "jsonwebtoken";

export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
}

export const signAccessToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_ACCESS_SECRET as string, {
    expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || "15m") as SignOptions["expiresIn"],
  });

export const signRefreshToken = (payload: TokenPayload): string =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || "7d") as SignOptions["expiresIn"],
  });

export const verifyAccessToken = (token: string): TokenPayload =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as TokenPayload;

export const verifyRefreshToken = (token: string): TokenPayload =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload;
