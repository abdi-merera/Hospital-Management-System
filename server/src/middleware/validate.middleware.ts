import type { NextFunction, Request, Response } from 'express';

export type Validator = (body: unknown) => string[];

export function validateBody(validator: Validator) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validator(req.body);

    if (errors.length > 0) {
      return res.status(400).json({ message: 'error', errors });
    }

    return next();
  };
}
