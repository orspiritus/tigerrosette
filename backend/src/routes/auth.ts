import { Router, Request, Response } from 'express';
import { validateTelegramAuth } from '../utils/telegram';
import { generateToken } from '../utils/jwt';
import { authenticateToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import prisma from '../lib/prisma';
import { TelegramInitData } from '../types/auth';

const router = Router();

// Apply rate limiting to auth routes
router.use(authLimiter);

// Telegram Mini App authentication
router.post('/telegram', async (req: Request, res: Response): Promise<void> => {
  try {
    const authData = req.body as TelegramInitData;

    // Validate Telegram auth data
    const isValid = validateTelegramAuth(authData);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid Telegram authentication data' });
      return;
    }

    // Check if user exists, if not create
    let user = await prisma.user.findUnique({
      where: { telegramId: BigInt(authData.user.id) },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          telegramId: BigInt(authData.user.id),
          username: authData.user.username || null,
          firstName: authData.user.first_name,
          lastName: authData.user.last_name || null,
          level: 1,
          totalExperience: 0,
          totalVolts: 0,
          premiumVolts: 0,
          energy: 100,
          maxEnergy: 100,
          energyLastRefilled: new Date(),
          lastActive: new Date(),
          joinedAt: new Date(),
        },
      });
    } else {
      // Update last active and user info
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          username: authData.user.username || user.username,
          firstName: authData.user.first_name,
          lastName: authData.user.last_name || user.lastName,
          lastActive: new Date(),
        },
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, authData.user.id);

    res.json({
      token,
      user: {
        id: user.id,
        telegramId: user.telegramId.toString(),
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        level: user.level,
        totalExperience: user.totalExperience,
        totalVolts: user.totalVolts,
        premiumVolts: user.premiumVolts,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
      },
    });
  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Get current user info
router.get('/me', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      id: user.id,
      telegramId: user.telegramId.toString(),
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      level: user.level,
      totalExperience: user.totalExperience,
      totalVolts: user.totalVolts,
      premiumVolts: user.premiumVolts,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyLastRefilled: user.energyLastRefilled,
      lastActive: user.lastActive,
      joinedAt: user.joinedAt,
      achievements: user.achievements.map((ua: any) => ({
        id: ua.achievement.id,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        voltReward: ua.achievement.voltReward,
        premiumVoltReward: ua.achievement.premiumVoltReward,
        unlockedAt: ua.unlockedAt,
      })),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info' });
  }
});

// Logout (invalidate token on client side)
router.post('/logout', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  // In a more advanced implementation, you could maintain a blacklist of tokens
  // For now, we'll just return success as the client should remove the token
  res.json({ message: 'Successfully logged out' });
});

export default router;
