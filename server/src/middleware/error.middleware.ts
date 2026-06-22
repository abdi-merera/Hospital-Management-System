import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: 'error',
    errors: [error.message || 'Internal server error'],
  });
};
