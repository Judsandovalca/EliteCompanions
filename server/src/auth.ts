import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Response, Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET ?? "change-me-to-a-random-secret";
const COOKIE_NAME = "token";
const MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
const BCRYPT_ROUNDS = 12;

interface TokenPayload {
  userId: string;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function createToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: MAX_AGE });
}

export function setTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE * 1000, // ms
    path: "/",
  });
}

export function clearTokenCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
}

export function getUserIdFromRequest(req: Request): string | null {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return payload.userId;
  } catch {
    return null;
  }
}
