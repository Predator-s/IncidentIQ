import bcrypt from "bcryptjs";
import type { User } from "@prisma/client";
import prisma from "../lib/prisma.js";
import ApiError from "../utils/ApiError.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  type TokenPayload,
} from "../utils/jwt.js";
import type { RegisterInput, LoginInput, RefreshInput } from "../validators/auth.validator.js";

interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface AuthResult {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
}

const publicUser = (u: User): PublicUser => ({
  id: u.id,
  name: u.name,
  email: u.email,
  createdAt: u.createdAt,
});

const issueTokens = (user: User) => {
  const payload: TokenPayload = { sub: user.id, email: user.email, name: user.name };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
};

export const register = async ({ name, email, password }: RegisterInput): Promise<AuthResult> => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ApiError(409, "Email already registered");

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { name, email, password: hashed } });

  const tokens = issueTokens(user);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken, createdById: user.id, updatedById: user.id },
  });

  return { user: publicUser(user), ...tokens };
};

export const login = async ({ email, password }: LoginInput): Promise<AuthResult> => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid credentials");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw new ApiError(401, "Invalid credentials");

  const tokens = issueTokens(user);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user: publicUser(user), ...tokens };
};

export const refresh = async ({ refreshToken }: RefreshInput): Promise<AuthResult> => {
  let payload: TokenPayload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  // Token rotation: stored token must match the presented one.
  if (!user || user.refreshToken !== refreshToken) {
    throw new ApiError(401, "Refresh token has been revoked");
  }

  const tokens = issueTokens(user);
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return { user: publicUser(user), ...tokens };
};

export const logout = async (userId: string): Promise<void> => {
  await prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
};
