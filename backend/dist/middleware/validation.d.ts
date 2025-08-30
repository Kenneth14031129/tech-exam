import { Request, Response, NextFunction } from 'express';
export declare const validateEthereumAddress: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const rateLimiter: (windowMs?: number, max?: number) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
