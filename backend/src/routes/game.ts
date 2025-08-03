import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { gameLimiter } from '../middleware/rateLimiter';
import prisma from '../lib/prisma';
import { calculateLevel, calculateLevelProgress } from '../utils/levelSystem';

const router = Router();

// Apply rate limiting to game routes
router.use(gameLimiter);

// All game routes require authentication
router.use(authenticateToken);

// Submit game score
router.post('/score', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const { score, level, timePlayed } = req.body;

    if (!score || !level || !timePlayed) {
      res.status(400).json({ error: 'Score, level, and timePlayed are required' });
      return;
    }

    // Basic validation
    if (score < 0 || level < 1 || level > 4 || timePlayed < 0) {
      res.status(400).json({ error: 'Invalid game data' });
      return;
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check energy
    if (user.energy <= 0) {
      res.status(400).json({ error: 'Not enough energy' });
      return;
    }

    // Calculate experience and volts
    const baseExperience = Math.floor(score / 10);
    const baseVolts = Math.floor(score / 5);
    
    // Level multipliers
    const levelMultipliers = { 1: 1, 2: 1.5, 3: 2, 4: 3 };
    const multiplier = levelMultipliers[level as keyof typeof levelMultipliers] || 1;
    
    const experienceGained = Math.floor(baseExperience * multiplier);
    const voltsGained = Math.floor(baseVolts * multiplier);

    // Calculate new level
    const newTotalExperience = user.totalExperience + experienceGained;
    const newLevel = calculateLevel(newTotalExperience);

    // Energy cost (1 energy per game)
    const energyCost = 1;
    const newEnergy = Math.max(0, user.energy - energyCost);

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        totalExperience: newTotalExperience,
        totalVolts: user.totalVolts + voltsGained,
        level: newLevel,
        energy: newEnergy,
        lastActive: new Date(),
      },
    });

    // Create game session record
    await prisma.gameSession.create({
      data: {
        userId: user.id,
        score,
        level,
        experienceGained,
        voltsGained,
        energyUsed: energyCost,
        timePlayed,
        duration: timePlayed, // Using timePlayed as duration for now
        clicks: 0, // Would be tracked in real implementation
        shocks: 0, // Would be tracked in real implementation
        difficulty: level.toString(),
        playedAt: new Date(),
      },
    });

    // Check for level up
    const leveledUp = newLevel > user.level;
    let levelUpReward = 0;
    
    if (leveledUp) {
      levelUpReward = newLevel * 50; // 50 volts per level
      await prisma.user.update({
        where: { id: user.id },
        data: {
          totalVolts: updatedUser.totalVolts + levelUpReward,
        },
      });
    }

    // Calculate level progress
    const levelProgress = calculateLevelProgress(newTotalExperience);

    res.json({
      success: true,
      experienceGained,
      voltsGained,
      levelUpReward,
      leveledUp,
      newLevel,
      levelProgress,
      newEnergy,
      totalExperience: newTotalExperience,
      totalVolts: updatedUser.totalVolts + (leveledUp ? levelUpReward : 0),
    });
  } catch (error) {
    console.error('Score submission error:', error);
    res.status(500).json({ error: 'Failed to submit score' });
  }
});

// Get user statistics
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Get game sessions for statistics
    const sessions = await prisma.gameSession.findMany({
      where: { userId: user.id },
      orderBy: { playedAt: 'desc' },
      take: 10, // Last 10 sessions
    });

    const totalSessions = await prisma.gameSession.count({
      where: { userId: user.id },
    });

    const bestScore = await prisma.gameSession.findFirst({
      where: { userId: user.id },
      orderBy: { score: 'desc' },
    });

    const totalTimePlayed = await prisma.gameSession.aggregate({
      where: { userId: user.id },
      _sum: { timePlayed: true },
    });

    // Calculate level progress
    const levelProgress = calculateLevelProgress(user.totalExperience);

    res.json({
      level: user.level,
      totalExperience: user.totalExperience,
      levelProgress,
      totalVolts: user.totalVolts,
      premiumVolts: user.premiumVolts,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyLastRefilled: user.energyLastRefilled,
      totalSessions,
      bestScore: bestScore?.score || 0,
      totalTimePlayed: totalTimePlayed._sum.timePlayed || 0,
      recentSessions: sessions.map((session: any) => ({
        id: session.id,
        score: session.score,
        level: session.level,
        experienceGained: session.experienceGained,
        voltsGained: session.voltsGained,
        timePlayed: session.timePlayed,
        playedAt: session.playedAt,
      })),
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const { type = 'level', limit = '10' } = req.query;
    const limitNum = Math.min(parseInt(limit as string, 10) || 10, 100);

    let orderBy: any;
    switch (type) {
      case 'volts':
        orderBy = { totalVolts: 'desc' };
        break;
      case 'experience':
        orderBy = { totalExperience: 'desc' };
        break;
      case 'level':
      default:
        orderBy = [{ level: 'desc' }, { totalExperience: 'desc' }];
    }

    const users = await prisma.user.findMany({
      orderBy,
      take: limitNum,
      select: {
        id: true,
        username: true,
        firstName: true,
        level: true,
        totalExperience: true,
        totalVolts: true,
      },
    });

    const leaderboard = users.map((user: any, index: number) => ({
      rank: index + 1,
      id: user.id,
      username: user.username || `${user.firstName}`,
      level: user.level,
      totalExperience: user.totalExperience,
      totalVolts: user.totalVolts,
    }));

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Refill energy
router.post('/refill-energy', async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Check if enough time has passed (energy refills 1 per 10 minutes)
    const now = new Date();
    const lastRefill = user.energyLastRefilled;
    const timeDiff = now.getTime() - lastRefill.getTime();
    const minutesPassed = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesPassed < 10) {
      const minutesRemaining = 10 - minutesPassed;
      res.status(400).json({ 
        error: 'Energy refill not ready yet',
        minutesRemaining,
      });
      return;
    }

    // Calculate energy to refill
    const energyToRefill = Math.min(Math.floor(minutesPassed / 10), user.maxEnergy - user.energy);
    
    if (energyToRefill <= 0) {
      res.status(400).json({ error: 'Energy already full' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        energy: user.energy + energyToRefill,
        energyLastRefilled: now,
      },
    });

    res.json({
      success: true,
      energyRefilled: energyToRefill,
      newEnergy: updatedUser.energy,
      maxEnergy: updatedUser.maxEnergy,
    });
  } catch (error) {
    console.error('Refill energy error:', error);
    res.status(500).json({ error: 'Failed to refill energy' });
  }
});

export default router;
