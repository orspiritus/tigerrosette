import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/jwt';
import { AuthenticatedUser } from '../types/auth';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }

  // In a real implementation, you would fetch the full user data from the database
  // For now, we'll just attach the decoded token data
  req.user = {
    id: decoded.userId,
    telegramId: BigInt(decoded.telegramId),
    username: undefined,
    firstName: '',
    level: 1,
    totalExperience: 0,
    totalVolts: 0,
    premiumVolts: 0,
    energy: 100,
  } as unknown as AuthenticatedUser;

  next();
}

export function optionalAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      req.user = {
        id: decoded.userId,
        telegramId: BigInt(decoded.telegramId),
        username: undefined,
        firstName: '',
        level: 1,
        totalExperience: 0,
        totalVolts: 0,
        premiumVolts: 0,
        energy: 100,
      } as unknown as AuthenticatedUser;
    }
  }

  next();
}
