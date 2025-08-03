import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', error);

  // Handle specific error types
  if (error.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation error',
      details: error.message,
    });
    return;
  }

  if (error.name === 'JsonWebTokenError') {
    res.status(401).json({
      error: 'Invalid token',
    });
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json({
      error: 'Token expired',
    });
    return;
  }

  // Handle Prisma errors
  if (error.message.includes('Unique constraint')) {
    res.status(409).json({
      error: 'Resource already exists',
    });
    return;
  }

  // Default error
  res.status(500).json({
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message }),
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
  });
}
