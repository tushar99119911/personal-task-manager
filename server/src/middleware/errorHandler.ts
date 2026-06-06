import type { Request, Response, NextFunction } from 'express';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Route not found', statusCode: 404 });
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(error);
  res.status(500).json({ error: 'Internal server error', statusCode: 500 });
}
