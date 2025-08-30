import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';

export const validateEthereumAddress = (req: Request, res: Response, next: NextFunction) => {
  const { address } = req.params;
  
  if (!address) {
    return res.status(400).json({
      success: false,
      error: 'Ethereum address is required',
      timestamp: Date.now()
    });
  }

  if (!ethers.isAddress(address)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid Ethereum address format',
      timestamp: Date.now()
    });
  }

  next();
};

export const rateLimiter = (windowMs: number = 60000, max: number = 100) => {
  const requests: Map<string, { count: number; resetTime: number }> = new Map();

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - windowMs;

    for (const [ip, data] of requests.entries()) {
      if (data.resetTime < windowStart) {
        requests.delete(ip);
      }
    }

    const clientData = requests.get(clientIP);
    
    if (!clientData) {
      requests.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientData.resetTime < now) {
      requests.set(clientIP, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (clientData.count >= max) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later',
        timestamp: now
      });
    }

    clientData.count++;
    next();
  };
};