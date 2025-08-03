import jwt, { SignOptions } from 'jsonwebtoken';
import { JWTPayload } from '../types/auth';
import config from '../config';

/**
 * Generates a JWT token for a user
 */
export function generateToken(userId: string, telegramId: number): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId,
    telegramId,
  };

  return jwt.sign(payload, config.jwtSecret as string, {
    expiresIn: config.jwtExpiresIn,
  } as any);
}

/**
 * Verifies and decodes a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts JWT token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
}
