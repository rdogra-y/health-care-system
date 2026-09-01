import jwt from "jsonwebtoken";

export type AuthTokenPayload = {
  userId: number;
  email: string;
  role: "ADMIN" | "DOCTOR" | "RECEPTIONIST";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return secret;
}

export function createAccessToken(
  payload: AuthTokenPayload
) {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: "8h"
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(
    token,
    getJwtSecret()
  ) as AuthTokenPayload;
}